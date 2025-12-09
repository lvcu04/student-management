<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;

class PredictStudentRisk extends Command
{
    /**
     * Tên và chữ ký của lệnh (dùng để gọi trong terminal: php artisan predict:student-risk)
     *
     * @var string
     */
    protected $signature = 'predict:student-risk';

    /**
     * Mô tả lệnh.
     *
     * @var string
     */
    protected $description = 'Chạy phân tích AI (Python) để dự đoán nguy cơ rớt môn/bỏ học của sinh viên dựa trên GPA và Điểm rèn luyện.';

    /**
     * Thực thi lệnh.
     */
    public function handle()
    {
        $this->info('🚀 Đang khởi động bộ phân tích AI...');

        // 1. Lấy dữ liệu sinh viên từ Database
        // Chỉ lấy sinh viên đang học, loại bỏ Admin
        $students = User::where('role', 'student')
                        ->where('status', 'Đang học')
                        ->get(['id', 'name', 'gpa', 'training_score', 'code']);

        if ($students->isEmpty()) {
            $this->warn('⚠️ Không tìm thấy sinh viên nào để phân tích.');
            return;
        }

        $this->info("📊 Đang chuẩn bị dữ liệu cho {$students->count()} sinh viên...");

        // 2. Chuẩn bị dữ liệu input cho Python (JSON)
        // Lưu ý: Nếu cột training_score chưa có dữ liệu, ta tạm gán mặc định để code không lỗi
        $inputData = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'gpa' => (float) $student->gpa,
                // Nếu chưa có cột training_score trong DB, mặc định là 70 (Khá)
                'training_score' => $student->training_score ?? 70, 
                // Các chỉ số phụ (nếu chưa có trong DB thì Python sẽ tự random hoặc gán mặc định)
                'absences' => 0, 
                'tuition_debt' => 0
            ];
        })->toArray();

        // 3. Gọi Script Python
        $scriptPath = base_path('python_scripts/risk_analysis.py');
        
        // Kiểm tra file Python có tồn tại không
        if (!file_exists($scriptPath)) {
            $this->error("❌ Không tìm thấy file Python tại: {$scriptPath}");
            return;
        }

        $this->info('🧠 Đang chạy mô hình Machine Learning (Random Forest)...');

        // Thực thi lệnh python
        // Lưu ý: Đảm bảo lệnh 'python' hoặc 'python3' chạy được trên server của bạn
        $result = Process::run([
            'python', // Hoặc 'python3' tùy môi trường
            $scriptPath, 
            json_encode($inputData)
        ]);

        // 4. Xử lý kết quả trả về
        if ($result->failed()) {
            $this->error('❌ Lỗi khi chạy Python Script:');
            $this->error($result->errorOutput());
            Log::error('AI Prediction Error: ' . $result->errorOutput());
            return;
        }

        $output = $result->output();
        $predictions = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('❌ Lỗi định dạng JSON trả về từ Python.');
            Log::error('AI JSON Parse Error: ' . $output);
            return;
        }

        // 5. Cập nhật kết quả vào Database
        $bar = $this->output->createProgressBar(count($predictions));
        $bar->start();

        foreach ($predictions as $pred) {
            if (isset($pred['error'])) {
                continue;
            }

            // Tìm và cập nhật user
            $student = User::find($pred['id']);
            if ($student) {
                $student->update([
                    'risk_score' => $pred['risk_score'],
                    'risk_status' => $pred['risk_status'],
                    // Có thể thêm cột 'last_predicted_at' => now() nếu muốn
                ]);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('✅ Hoàn tất! Đã cập nhật kết quả dự đoán cho toàn bộ sinh viên.');
    }
}