<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\AiMentorService;
use App\Notifications\StudentFeedbackNotification;

class SendWeeklyFeedback extends Command
{
    protected $signature = 'send:weekly-feedback';
    protected $description = 'Gửi tin nhắn động viên/nhắc nhở sinh viên định kỳ';

    public function handle(AiMentorService $aiService)
    {
        $this->info('Đang khởi tạo AI Mentor để gửi tin nhắn...');

        // Lấy danh sách sinh viên đang học
        $students = User::where('role', 'student')
                        ->where('status', 'Đang học')
                        ->get();

        $bar = $this->output->createProgressBar(count($students));

        foreach ($students as $student) {
            $type = 'dong_vien'; // Mặc định
            if ($student->gpa >= 3.2 && $student->training_score >= 80) {
                $type = 'khen_ngoi'; // Màu xanh
            } elseif ($student->risk_status === 'High Risk' || $student->gpa < 2.0) {
                $type = 'canh_bao'; // Màu đỏ
            }

            // 2. Gọi AI sinh nội dung (như cũ)
            $message = $aiService->generateMessage($student);

            // 3. Gửi thông báo (Chỉ Database)
            $student->notify(new \App\Notifications\StudentFeedbackNotification($message, $type));
        }

        $bar->finish();
        $this->newLine();
        $this->info('✅ Đã gửi tin nhắn động viên cho tất cả sinh viên!');
    }
}