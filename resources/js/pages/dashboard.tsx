import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
// Thêm Edit, Trash2 vào imports
import { GraduationCap, MoreHorizontal, Plus, Search, TrendingUp, Users, Edit, Trash2 } from 'lucide-react'; 
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
// Import Select để chọn trạng thái (nếu thư viện UI của bạn có, nếu chưa thì dùng select thường của HTML)
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
    const [editingId, setEditingId] = useState<number | null>(null); // State lưu ID khi sửa

    // Khai báo full các trường dữ liệu
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        email: '',
        date_of_birth: '',
        address: '',
        class: '',
        gpa: '',
        status: 'Đang học', // Mặc định
    });

    // Hàm mở modal để THÊM MỚI
    const handleCreate = () => {
        setEditingId(null);
        reset(); // Xóa trắng form
        clearErrors();
        setOpen(true);
    };

    // Hàm mở modal để SỬA
    const handleEdit = (student: Student) => {
        setEditingId(student.id);
        setData({
            name: student.name,
            code: student.code,
            email: student.email,
            date_of_birth: student.date_of_birth || '',
            address: student.address || '',
            class: student.class || '',
            gpa: student.gpa ? student.gpa.toString() : '',
            status: student.status || 'Đang học',
        });
        clearErrors();
        setOpen(true);
    };

    // Hàm XỬ LÝ SUBMIT (Tự động phân biệt Thêm/Sửa)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            // Logic UPDATE
            put(route('students.update', editingId), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setEditingId(null);
                },
            });
        } else {
            // Logic CREATE
            post(route('students.store'), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    // Hàm XÓA
    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa sinh viên này? Hành động này không thể hoàn tác.')) {
            router.delete(route('students.destroy', id));
        }
    };

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

                    {/* MODAL FORM (Dùng chung cho Thêm & Sửa) */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            {/* Nút mở modal gọi handleCreate */}
                            <button 
                                onClick={handleCreate}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm sinh viên
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Cập nhật thông tin' : 'Thêm sinh viên mới'}</DialogTitle>
                                <DialogDescription>
                                    {editingId ? 'Chỉnh sửa thông tin sinh viên hiện tại.' : 'Nhập thông tin sinh viên mới vào hệ thống. Mật khẩu mặc định: 12345678'}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                {/* Hàng 1: Tên & Mã SV */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Họ tên <span className="text-red-500">*</span></Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="code">Mã SV <span className="text-red-500">*</span></Label>
                                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                                        {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                                    </div>
                                </div>

                                {/* Hàng 2: Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>

                                {/* Hàng 3: Lớp & GPA */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="class">Lớp</Label>
                                        <Input id="class" value={data.class} onChange={(e) => setData('class', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gpa">GPA</Label>
                                        <Input id="gpa" type="number" step="0.01" min="0" max="4" value={data.gpa} onChange={(e) => setData('gpa', e.target.value)} />
                                        {errors.gpa && <p className="text-red-500 text-xs">{errors.gpa}</p>}
                                    </div>
                                </div>

                                {/* Hàng 4: Ngày sinh & Trạng thái */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="dob">Ngày sinh</Label>
                                        <Input id="dob" type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Trạng thái</Label>
                                        <select 
                                            id="status" 
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.status} 
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="Đang học">Đang học</option>
                                            <option value="Bảo lưu">Bảo lưu</option>
                                            <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
                                            <option value="Thôi học">Thôi học</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Hàng 5: Địa chỉ */}
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Đang xử lý...' : (editingId ? 'Lưu thay đổi' : 'Thêm mới')}
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
                                                {student.code || '---'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {student.class || '---'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                                                    ${student.status === 'Đang học' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                        student.status === 'Bảo lưu' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                                                        student.status === 'Thôi học' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                    {student.status || 'Mới tạo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {student.gpa || '0.0'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(student)}
                                                        className="rounded-md p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Sửa thông tin"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(student.id)}
                                                        className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Xóa sinh viên"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-8 w-8 text-gray-300" />
                                                <p>Chưa có dữ liệu sinh viên nào.</p>
                                                <Button variant="outline" size="sm" onClick={handleCreate}>Thêm sinh viên đầu tiên</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination (nếu có nhiều trang) */}
                    {students.last_page > 1 && (
                        <div className="p-4 border-t flex justify-center gap-2">
                           {students.links.map((link: any, k: number) => (
                                <button 
                                    key={k}
                                    disabled={!link.url || link.active}
                                    onClick={() => router.get(link.url)}
                                    dangerouslySetInnerHTML={{__html: link.label}}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-black text-white' : 'hover:bg-gray-100'} ${!link.url ? 'opacity-50' : ''}`}
                                />
                           ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}