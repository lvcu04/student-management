<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;
use App\Services\AiMentorService;
use App\Notifications\StudentFeedbackNotification;

class AnalyzeStudentRisk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $student;

    public function __construct(User $student)
    {
        $this->student = $student;
    }

    /**
     * Execute the job.
     */
    public function handle(AiMentorService $aiService)
    {
        // Chuẩn bị dữ liệu cho Python
        $inputData = [[
            'id' => $this->student->id,
            'name' => $this->student->name,
            'gpa' => (float) $this->student->gpa,
            'training_score' => $this->student->training_score ?? 70,
            'absences' => $this->student->absences ?? 0,
            'tuition_debt' => 0
        ]];
        $scriptPath = base_path('python_scripts/risk_analysis.py');

        $result = Process::run(['python', $scriptPath, json_encode($inputData)]);

        if($result->false()){
            Log::error("AnalyzeStudentRisk Error: " . $result->errorOutput());
            return;
        }
        $predictions = json_decode($result->output(), true)[0] ?? null;

        if ($predictions) {
            // Cập nhật điểm rủi ro và trạng thái
            $this->student->updateQuietly([ // dùng updateQuietly để không kích hoạt Observer lần nữa (tránh lặp vô tận)
                'risk_score' => $prediction['risk_score'],
                'risk_status' => $prediction['risk_status'],
                'predicted_at' => now(),
            ]);
            $this->sendImmediateFeedback($aiService);
            
    }}
    protected function sendImmediateFeedback($aiService)
    {
        // Logic chọn màu sắc
        $type = 'dong_vien';
        if ($this->student->risk_status === 'High Risk') $type = 'canh_bao';
        elseif ($this->student->gpa >= 3.2 && $this->student->training_score >= 80) $type = 'khen_ngoi';

        // Gọi AI viết lời nhắn mới nhất
        $message = $aiService->generateMessage($this->student);

        // Gửi thông báo
        $this->student->notify(new StudentFeedbackNotification($message, $type));
    }

        
}
