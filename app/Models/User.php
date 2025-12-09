<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'code',
        'class',
        'status',
        'gpa',
        'date_of_birth', 
        'address',
        'role',
        // --- CÁC TRƯỜNG MỚI CHO AI & ĐIỂM RÈN LUYỆN ---
        'training_score', // Điểm rèn luyện
        'risk_score',     // Điểm rủi ro (0-100)
        'risk_status',    // Trạng thái (High/Medium/Low)
        'predicted_at',   // Thời gian dự đoán gần nhất
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'predicted_at' => 'datetime', // Ép kiểu này để dùng được hàm format ngày tháng
        ];
    }

    public function isAdmin() {
        return $this->role === 'admin';
    }
}