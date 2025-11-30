import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react'; // Import Link để chuyển trang nếu cần
import { GraduationCap, MoreHorizontal, Plus, Search, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url }, // Sửa lại title cho đúng type
];


const iconMap: Record<string, any> = {
    users: Users,
    graduation: GraduationCap,
    trending: TrendingUp,
};


interface Student {
    id: number;
    name: string;
    email: string;
    class: string | null; 
    status: string | null;
    gpa: number | null;
}

interface DashboardProps {
    students: {
        data: Student[]; 
        links: any[];    
        current_page: number;
        last_page: number;
    };
    stats: Array<{
        title: string;
        value: string | number;
        change: string;
        type: string; 
        color: string;
    }>;
}

export default function Dashboard({ students, stats }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý sinh viên" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Tổng quan
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Báo cáo tình hình sinh viên và kết quả học tập.
                        </p>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        <Plus className="h-4 w-4" />
                        Thêm sinh viên
                    </button>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => {
                        // Lấy icon từ map dựa trên type gửi từ PHP
                        const IconComponent = iconMap[stat.type] || Users; 
                        
                        return (
                            <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                        <h4 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h4>
                                    </div>
                                    <div className={`rounded-full p-3 bg-opacity-10 ${stat.color} bg-current`}>
                                        <IconComponent className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="font-medium text-green-500">{stat.change}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Table Section */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    
                    {/* Toolbar */}
                    <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <Search className="h-4 w-4 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm sinh viên..." 
                                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Họ và tên</th>
                                    <th className="px-6 py-3 font-medium">Lớp</th>
                                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                                    <th className="px-6 py-3 font-medium">GPA</th>
                                    <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {/* Lưu ý: Phải map qua students.data vì dùng paginate */}
                                {students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </td>
                                            {/* Xử lý hiển thị nếu dữ liệu null */}
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {student.class || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                                                    ${student.status === 'Đang học' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 
                                                      student.status === 'Bảo lưu' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' : 
                                                      'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                    {student.status || 'Mới tạo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {student.gpa || '0.0'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Chưa có dữ liệu sinh viên nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* (Optional) Thêm phần hiển thị phân trang ở đây nếu muốn */}
                </div>
            </div>
        </AppLayout>
    );
}