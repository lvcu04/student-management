<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'code' => ['required', 'string', 'max:255', 'unique:users'], // Mã sinh viên phải duy nhất
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        // 2. Tạo sinh viên mới
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'code' => $validated['code'],
            'password' => Hash::make('12345678'), 
            'date_of_birth' => $validated['date_of_birth'], 
            'address' => $validated['address'],
            'status' => 'Đang học', // Mặc định
            'gpa' => 0.0,           // Mặc định
        ]);

        // 3. Redirect về trang cũ kèm thông báo (nếu dùng flash message)
        return redirect()->back()->with('success', 'Thêm sinh viên thành công!');
    }
    // THÊM MỚI: Hàm cập nhật
    public function update(Request $request, User $student)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // Validate unique ngoại trừ chính user đang sửa
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$student->id],
            'code' => ['required', 'string', 'max:255', 'unique:users,code,'.$student->id],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'class' => ['nullable', 'string'],
            'status' => ['nullable', 'string'], // Thêm status
            'gpa' => ['nullable', 'numeric', 'min:0', 'max:4.0'], // Thêm GPA
        ]);

        $student->update($validated);

        return redirect()->back()->with('success', 'Đã cập nhật thông tin sinh viên!');
    }

    // THÊM MỚI: Hàm xóa
    public function destroy(User $student)
    {
        $student->delete();
        return redirect()->back()->with('success', 'Đã xóa sinh viên khỏi hệ thống!');
    }
}
