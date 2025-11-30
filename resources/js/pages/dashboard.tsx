import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { GraduationCap, MoreHorizontal, Plus, Search, TrendingUp, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard.url() },
];

const iconMap: Record<string, any> = {
    users: Users,
    graduation: GraduationCap,
    trending: TrendingUp,
};

interface Student {
    id: number;
    name: string;
    code: string;
    email: string;
    date_of_birth: string | null;
    address: string | null;
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
    const [open, setOpen] = useState(false);

    // SỬA ĐỔI: Chỉ sử dụng 'code', bỏ 'student_code' để khớp với database
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '', // Dùng 'code'
        email: '',
        date_of_birth: '',
        address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hàm route() giờ đã được import và sẽ hoạt động
        post(route('students.store'), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

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

                    {/* MODAL THÊM SINH VIÊN */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                <Plus className="h-4 w-4" />
                                Thêm sinh viên
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Thêm sinh viên mới</DialogTitle>
                                <DialogDescription>
                                    Nhập thông tin sinh viên vào form dưới đây. Mật khẩu mặc định là 12345678.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Họ tên</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                    </div>
                                </div>
                                
                                {/* SỬA ĐỔI: Input Mã SV binding vào 'code' thay vì 'student_code' */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">Mã SV</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="code"
                                            value={data.code} // Sửa thành data.code
                                            onChange={(e) => setData('code', e.target.value)} // Sửa thành setData('code')
                                            placeholder="SV001"
                                            required
                                        />
                                        {/* Sửa hiển thị lỗi thành errors.code */}
                                        {errors.code && <div className="text-red-500 text-xs mt-1">{errors.code}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@example.com"
                                            required
                                        />
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="dob" className="text-right">Ngày sinh</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="dob"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Hà Nội, Việt Nam"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Đang lưu...' : 'Lưu sinh viên'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => {
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
                                    <th className="px-6 py-3 font-medium">Mã SV</th>
                                    <th className="px-6 py-3 font-medium">Họ và tên</th>
                                    <th className="px-6 py-3 font-medium">Lớp</th>
                                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                                    <th className="px-6 py-3 font-medium">GPA</th>
                                    <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {/* Hiển thị Mã SV */}
                                                {student.code || '---'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </td>
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
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Chưa có dữ liệu sinh viên nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}