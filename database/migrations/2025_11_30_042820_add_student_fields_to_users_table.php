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
            $table->string('code')->default('SV001')->unique()->after('id');
            $table->string('class')->nullable()->after('email');
            $table->string('status')->default('Đang học')->after('class');
            $table->float('gpa',3,2)->default(0.0)->after('status');
            $table->date('date_of_birth')->nullable()->after('gpa');
            $table->string('address', 500)->nullable()->after('date_of_birth');
            $table->string('role')->default('student')->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['code','class', 'status', 'gpa','date_of_birth', 'address']);
        });
    }
};
