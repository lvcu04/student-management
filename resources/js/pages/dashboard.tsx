import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { GraduationCap, MoreHorizontal, Plus, Search, TrendingUp, Users, Edit, Trash2, Video, User as UserIcon, MapPin, Calendar, Mail, IdCard } from 'lucide-react';
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

// Interface cho đối tượng Sinh viên
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
    role: string;
}

// Interface cho Props truyền từ Laravel
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
    auth: {
        user: Student; 
    };
    notifications: any[];
}

export default function Dashboard({ students, stats, notifications }: DashboardProps) {
    // 1. Lấy thông tin User đang đăng nhập để kiểm tra quyền
    const { auth } = usePage<any>().props;
    const currentUser = auth.user;
    const isAdmin = currentUser.role === 'admin';

    // --- LOGIC CHO ADMIN (Form & Modal) ---
    // (Hooks vẫn phải chạy ở top level dù là student hay admin)
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        email: '',
        date_of_birth: '',
        address: '',
        class: '',
        gpa: '',
        status: 'Đang học',
    });

    const handleCreate = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setOpen(true);
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('students.update', editingId), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setEditingId(null);
                },
            });
        } else {
            post(route('students.store'), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
            router.delete(route('students.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* --- PHÂN QUYỀN GIAO DIỆN --- */}
                
                {isAdmin ? (
                    /* ================= GIAO DIỆN ADMIN ================= */
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Quản trị hệ thống
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Quản lý hồ sơ sinh viên và thống kê đào tạo.
                                </p>
                            </div>

                            {/* Nút Thêm mới (Chỉ Admin thấy) */}
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
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
                                        <DialogTitle>{editingId ? 'Cập nhật hồ sơ' : 'Thêm sinh viên mới'}</DialogTitle>
                                        <DialogDescription>
                                            {editingId ? 'Chỉnh sửa thông tin sinh viên.' : 'Tạo hồ sơ mới. Mật khẩu mặc định: 12345678'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="class">Lớp</Label>
                                                <Input id="class" value={data.class} onChange={(e) => setData('class', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="gpa">GPA</Label>
                                                <Input id="gpa" type="number" step="0.01" min="0" max="4" value={data.gpa} onChange={(e) => setData('gpa', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="dob">Ngày sinh</Label>
                                                <Input id="dob" type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Trạng thái</Label>
                                                <select 
                                                    id="status" 
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                                        <div className="grid gap-2">
                                            <Label htmlFor="address">Địa chỉ</Label>
                                            <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                                            <Button type="submit" disabled={processing}>Lưu lại</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Thống kê Admin */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {stats.map((stat, index) => {
                                const IconComponent = iconMap[stat.type] || Users;
                                return (
                                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                                <h4 className="mt-2 text-3xl font-bold">{stat.value}</h4>
                                            </div>
                                            <div className={`rounded-full p-3 bg-opacity-10 ${stat.color} bg-current`}>
                                                <IconComponent className={`h-6 w-6 ${stat.color}`} />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-sm font-medium text-green-500">{stat.change}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bảng Danh sách Sinh viên */}
                        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <input type="text" placeholder="Tìm kiếm sinh viên..." className="w-full bg-transparent text-sm outline-none dark:text-white" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Mã SV</th>
                                            <th className="px-6 py-3 font-medium">Họ tên</th>
                                            <th className="px-6 py-3 font-medium">Lớp</th>
                                            <th className="px-6 py-3 font-medium">Trạng thái</th>
                                            <th className="px-6 py-3 font-medium">GPA</th>
                                            <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {students.data.length > 0 ? (
                                            students.data.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 font-medium">{student.code || '---'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">{student.class || '---'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            student.status === 'Đang học' ? 'bg-green-100 text-green-700' : 
                                                            student.status === 'Bảo lưu' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>{student.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">{student.gpa || 0}</td>
                                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                        <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">Chưa có dữ liệu</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {students.last_page > 1 && (
                                <div className="p-4 border-t flex justify-center gap-2">
                                    {students.links.map((link: any, k: number) => (
                                        <button key={k} disabled={!link.url || link.active} onClick={() => router.get(link.url)} dangerouslySetInnerHTML={{__html: link.label}} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-black text-white' : 'hover:bg-gray-100'} ${!link.url ? 'opacity-50' : ''}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* ================= GIAO DIỆN SINH VIÊN ================= */
                    <div className="max-w-5xl mx-auto w-full space-y-6">
                        {/* Banner Chào mừng */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold">Xin chào, {currentUser.name}! 👋</h2>
                                <p className="mt-2 text-blue-100 text-lg">
                                    Chúc bạn một ngày học tập hiệu quả. Dưới đây là thông tin học tập của bạn.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform"></div>
                        </div>
                        {/* --- KHU VỰC THÔNG BÁO TỪ AI (MỚI) --- */}
                            {notifications.length > 0 && (
                                <div className="grid gap-4">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                                                notif.data.type === 'canh_bao' 
                                                    ? 'border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-900/20' 
                                                    : notif.data.type === 'khen_ngoi'
                                                    ? 'border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                                                    : 'border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon cảm xúc */}
                                                <div className="text-3xl">
                                                    {notif.data.type === 'canh_bao' ? '😟' : notif.data.type === 'khen_ngoi' ? '🌟' : '💡'}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-bold uppercase tracking-wide ${
                                                        notif.data.type === 'canh_bao' ? 'text-red-600' : notif.data.type === 'khen_ngoi' ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {notif.data.title}
                                                    </h4>
                                                    <p className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-100 italic">
                                                        "{notif.data.message}"
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-400">
                                                        Được gửi vào: {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        {/* Thông tin chính dạng Grid */}
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Thẻ GPA */}
                            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GraduationCap className="h-24 w-24 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider">Điểm tích lũy (GPA)</h3>
                                <p className="mt-4 text-5xl font-extrabold text-indigo-600">{currentUser.gpa || '0.0'}</p>
                                <p className="mt-2 text-sm text-gray-500">Trên thang điểm 4.0</p>
                            </div>

                            {/* Thẻ Trạng thái & Lớp */}
                            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-center space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-1">Trạng thái</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                        currentUser.status === 'Đang học' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {currentUser.status || 'Chưa cập nhật'}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-1">Lớp hành chính</h3>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.class || 'Chưa phân lớp'}</p>
                                </div>
                            </div>

                            {/* Thẻ Hành động nhanh */}
                            <div className="rounded-xl bg-blue-50 p-6 border border-blue-100 flex flex-col justify-center items-center text-center space-y-4 dark:bg-gray-900 dark:border-gray-700">
                                <Video className="h-12 w-12 text-blue-600 mb-2" />
                                <div>
                                    <h3 className="font-bold text-blue-900 dark:text-white">Lớp học trực tuyến</h3>
                                    <p className="text-sm text-blue-700 dark:text-gray-400">Tham gia lớp học ngay bây giờ</p>
                                </div>
                                <a 
                                    href={route('classroom')} 
                                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105"
                                >
                                    Vào lớp ngay
                                </a>
                            </div>
                        </div>

                        {/* Thông tin cá nhân chi tiết */}
                        <div className="rounded-xl bg-white shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-gray-500" />
                                    Thông tin cá nhân
                                </h3>
                            </div>
                            <div className="p-6 grid gap-6 md:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <IdCard className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Mã sinh viên</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{currentUser.code}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{currentUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày sinh</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{currentUser.date_of_birth || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{currentUser.address || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}