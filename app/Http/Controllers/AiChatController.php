<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    public function chat(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $request->validate([
            'message' => 'required|string',
        ]);
        
        $userMessage = $request->input('message');
        
        // 2. Lấy thông tin User đang đăng nhập
        $user = Auth::user();
        
        // 3. Chuẩn bị dữ liệu ngữ cảnh (Context)
        // Dựa trên các cột trong migration và model User của bạn
        $studentContext = "Người dùng chưa đăng nhập.";
        
        if ($user) {
            // Kiểm tra role để có xưng hô phù hợp
            $role = $user->role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

            $studentContext = "Thông tin chi tiết về người đang chat ({$role}):
            - Họ và tên: " . ($user->name ?? 'Chưa cập nhật') . "
            - Mã số (Code): " . ($user->code ?? 'Chưa có') . "
            - Email: " . ($user->email ?? 'Chưa có') . "
            - Lớp (Class): " . ($user->class ?? 'Chưa cập nhật') . "
            - Điểm GPA: " . ($user->gpa ?? 'Chưa có điểm') . "
            - Trạng thái: " . ($user->status ?? 'Không xác định') . "
            - Ngày sinh: " . ($user->date_of_birth ?? 'Chưa cập nhật') . "
            - Địa chỉ: " . ($user->address ?? 'Chưa cập nhật');
        }

        // 4. System Prompt: Cấu hình tính cách và nhiệm vụ cho AI
        $systemPrompt = "Bạn là trợ lý ảo hỗ trợ sinh viên của trường đại học.
        
        Dưới đây là thông tin hồ sơ của người bạn đang nói chuyện:
        ---
        {$studentContext}
        ---

        Nhiệm vụ của bạn:
        1. Trả lời các câu hỏi của sinh viên dựa trên thông tin hồ sơ ở trên.
        2. Nếu sinh viên hỏi: 'Tôi tên gì?', 'Điểm của tôi bao nhiêu?', hãy lấy dữ liệu trên để trả lời chính xác.
        3. Nếu sinh viên hỏi các vấn đề chung (không liên quan cá nhân), hãy trả lời bằng kiến thức của bạn.
        4. Trả lời ngắn gọn, thân thiện, xưng hô là 'bạn' và 'tôi'.
        5. Ngôn ngữ: Tiếng Việt.";

        try {
            // 5. Gọi API Ollama
            // Lấy URL từ file .env, fallback về localhost nếu không tìm thấy
            $ollamaUrl = env('OLLAMA_API_URL', 'http://127.0.0.1:11434/api/chat');
            $ollamaModel = env('OLLAMA_MODEL', 'llama3.2');

            // Log để debug (xem trong storage/logs/laravel.log)
            Log::info("AI Request: Đang gửi tin nhắn tới {$ollamaUrl}");

            $response = Http::timeout(60)->post($ollamaUrl, [
                'model' => $ollamaModel,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $userMessage
                    ]
                ],
                'stream' => false,
            ]);

            // 6. Xử lý kết quả trả về
            if ($response->successful()) {
                $data = $response->json();
                $aiAnswer = $data['message']['content'] ?? 'Xin lỗi, tôi không nhận được câu trả lời từ hệ thống.';
                
                return response()->json([
                    'answer' => $aiAnswer,
                ]);
            } else {
                Log::error("AI Error Response: " . $response->body());
                return response()->json([
                    'answer' => 'Hệ thống AI đang gặp sự cố. Mã lỗi: ' . $response->status()
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error("AI Connection Exception: " . $e->getMessage());
            return response()->json([
                'answer' => 'Không thể kết nối tới máy chủ AI.',
                'error_detail' => $e->getMessage() // Có thể bỏ dòng này khi chạy production
            ], 500);
        }
    }
}