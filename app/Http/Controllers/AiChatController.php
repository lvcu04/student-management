<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth; // Nhớ import Auth

class AiChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string']);
        $userMessage = $request->input('message');
        
        // 1. Lấy thông tin sinh viên đang đăng nhập
        $user = Auth::user();
        
        // 2. Tạo ngữ cảnh (Context) để AI hiểu nó đang nói chuyện với ai
        // Đây chính là cách bạn "dạy" nó về dữ liệu hiện tại
        $studentContext = "";
        if ($user) {
            $studentContext = "Thông tin sinh viên đang hỏi: 
            - Họ tên: {$user->name}
            - Mã SV: {$user->code}
            - Lớp: {$user->class}
            - GPA: {$user->gpa}
            - Nơi sinh: {$user->birth_place}
            - Ngày sinh: {$user->birth_date}
            - Trạng thái: {$user->status}
            - Email: {$user->email}";
        }

        // 3. System Prompt: Ra lệnh cho AI và cung cấp dữ liệu
        $systemPrompt = "Bạn là trợ lý ảo của trường đại học. 
        Nhiệm vụ: Trả lời ngắn gọn, lịch sự, đúng trọng tâm bằng tiếng Việt.
        Dưới đây là thông tin của sinh viên đang chat với bạn (chỉ dùng thông tin này nếu họ hỏi về bản thân):
        {$studentContext}
        
        Nếu sinh viên hỏi về điểm số hay thông tin cá nhân, hãy lấy từ dữ liệu trên để trả lời.
        Nếu không có thông tin, hãy nói là bạn không biết.";

        try {
            $response = Http::timeout(120)->post(env('OLLAMA_API_URL', 'http://127.0.0.1:11434/api/chat'), [
                'model' => env('OLLAMA_MODEL', 'llama3.2'),
                'messages' => [
                    [
                        'role' => 'system', 
                        'content' => $systemPrompt // Gửi kèm thông tin sinh viên vào đây
                    ],
                    [
                        'role' => 'user', 
                        'content' => $userMessage
                    ]
                ],
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'answer' => $data['message']['content'] ?? 'Xin lỗi, tôi không hiểu.',
                ]);
            } else {
                return response()->json(['answer' => 'Lỗi kết nối AI.'], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'answer' => 'Vui lòng kiểm tra lại Ollama.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}