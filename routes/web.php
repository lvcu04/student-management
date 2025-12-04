<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController; 
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AiChatController;
Route::get('/', function () {
    return redirect()->route('login');
});

// Nhóm các route cần đăng nhập mới xem được
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');


    Route::post('/ai-chat', [AiChatController::class, 'chat'])->name('ai.chat');
    Route::get('/classroom', function () {
        return Inertia::render('classroom');
    })->name('classroom');
});

require __DIR__.'/settings.php';