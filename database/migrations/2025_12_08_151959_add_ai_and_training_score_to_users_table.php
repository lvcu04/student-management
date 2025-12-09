<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kiểm tra xem cột 'role' đã có chưa để đặt vị trí cho đẹp
            // Nếu bảng users của bạn chưa có cột 'role', hãy bỏ đoạn '->after(...)' đi
            
            // 1. Điểm rèn luyện (Mặc định 70 - Khá)
            $table->integer('training_score')->default(70)->after('role');

            // 2. Điểm rủi ro do AI dự đoán
            $table->decimal('risk_score', 5, 2)->nullable()->after('training_score');

            // 3. Trạng thái rủi ro
            $table->string('risk_status')->nullable()->after('risk_score');

            // 4. Thời điểm dự đoán
            $table->timestamp('predicted_at')->nullable()->after('risk_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Xóa các cột này nếu rollback
            $table->dropColumn([
                'training_score',
                'risk_score',
                'risk_status',
                'predicted_at'
            ]);
        });
    }
};