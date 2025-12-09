<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiMentorService
{
    /**
     * Sinh nội dung tin nhắn động viên từ AI
     */
    public function generateMessage(User $student)
    {
        // 1. Xây dựng ngữ cảnh cho AI
        // Nếu sinh viên chưa có cột training_score trong DB, dùng mặc định là 70
        $trainingScore = $student->training_score ?? 70;
        $riskStatus = $student->risk_status ?? 'Chưa xác định';
        
        $context = "Sinh viên: {$student->name}. 
        GPA: {$student->gpa}/4.0. 
        Điểm rèn luyện: {$trainingScore}/100. 
        Số buổi vắng: {$student->absences}. 
        Trạng thái rủi ro: {$riskStatus}.";

        // 2. Prompt (Kịch bản) gửi cho AI
        $prompt = "Bạn là một cố vấn học tập thân thiện. Dựa vào thông tin sau:
        {$context}
        
        Hãy viết một lời nhắn ngắn (dưới 50 từ) gửi cho sinh viên này (xưng hô là 'thầy/cô' và 'em').
        - Nếu GPA cao (>3.2) và rèn luyện tốt (>80): Khen ngợi.
        - Nếu GPA thấp (<2.0) hoặc rủi ro cao: Động viên nhẹ nhàng, khuyên cố gắng hơn.
        - Giọng văn: Gần gũi, tích cực, không trách mắng.";

        // 3. Gọi API AI (Ollama)
        try {
            // Lấy URL từ file .env, nếu không có thì dùng mặc định localhost
            $ollamaUrl = env('OLLAMA_API_URL', 'http://127.0.0.1:11434/api/chat');
            $ollamaModel = env('OLLAMA_MODEL', 'llama3.2');

            $response = Http::timeout(10)->post($ollamaUrl, [
                'model' => $ollamaModel,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'stream' => false,
            ]);

            if ($response->successful()) {
                $content = $response->json()['message']['content'] ?? null;
                if ($content) {
                    return $content;
                }
            }
        } catch (\Exception $e) {
            Log::error("AiMentorService Error: " . $e->getMessage());
        }

        // 4. Fallback (Dự phòng nếu AI lỗi hoặc không chạy)
        // Trả về câu mẫu để hệ thống không bị crash
        if ($student->gpa >= 3.2) {
            return "Chào {$student->name}, kết quả học tập của em rất tốt. Hãy tiếp tục phát huy nhé!";
        } else {
            return "Chào {$student->name}, cố gắng hơn trong học kỳ này nhé. Nếu cần hỗ trợ hãy liên hệ cố vấn học tập.";
        }
    }
}