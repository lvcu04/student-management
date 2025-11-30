<?php 
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
class DashboardController extends Controller
{
    public function index()
    {

 
        $students = User::select('id', 'name', 'code', 'email', 'class', 'status', 'gpa', 'created_at')
            ->orderBy('created_at', 'desc') 
            ->paginate(10);

        $stats = [
            [
                'title' => 'Tổng sinh viên',
                'value' => User::count(),
                'change' => '+12 tháng này',
                'color' => 'text-blue-500',
                'type' => 'users' 
            ],
            [
                'title' => 'Sinh viên xuất sắc',
                'value' => User::where('gpa', '>=', 3.6)->count(),
                'change' => 'Trên 3.6 GPA',
                'color' => 'text-green-500',
                'type' => 'graduation'
            ],
            // Thêm các stat khác nếu cần
        ];

        return Inertia::render('dashboard', [
            'students' => $students,
            'stats' => $stats,
        ]);
    }
   
};
?>