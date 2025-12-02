<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo User mẫu với đầy đủ thông tin bắt buộc
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'), // Luôn nên mã hóa password
                'email_verified_at' => now(),
                
                // THÊM DÒNG NÀY (Bắt buộc vì DB yêu cầu)
                'code' => 'ADMIN', 
                'role' => 'admin',   // Nếu bạn đã chạy migration thêm role
                'class' => 'CNTT',   // Nếu có
                'status' => 'Đang học',
                'gpa' => 4.0,
            ]
        );
    }
}