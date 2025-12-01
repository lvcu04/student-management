import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

export default function Classroom() {
    // Lấy thông tin user đang đăng nhập để tự điền tên vào phòng họp
    const user = usePage<{ auth: { user: { name: string; email: string , class:string } } }>().props.auth.user;
    const [loading, setLoading] = useState(true);

    const ROOM_NAME = `Phong_Hoc_${user.class || 'Chung'}`;

    useEffect(() => {
        // Load Jitsi Script từ server của họ
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        
        script.onload = () => {
            setLoading(false);
            // @ts-ignore
            if (window.JitsiMeetExternalAPI) {
                // @ts-ignore
                const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
                    roomName: ROOM_NAME,
                    width: "100%",
                    height: "100%", 
                    parentNode: document.getElementById("jitsi-container"),
                    configOverwrite: { 
                        startWithAudioMuted: true, // Vào phòng tắt mic
                        disableDeepLinking: true,  // Không hỏi cài app mobile
                       
                    },
                    interfaceConfigOverwrite: { 
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    },
                    userInfo: {
                        displayName: user.name, // Tự hiện tên sinh viên
                        email: user.email
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Dọn dẹp script khi thoát trang
            if(script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);

    return (
        <AppLayout breadcrumbs={[{ title: 'Phòng học trực tuyến', href: '/classroom' }]}>
            <Head title="Lớp học Online" />
            
            <div className="flex flex-col h-[calc(110vh-120px)] p-4 gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live
                        </span>
                    </div>
                </div>

                {/* Khu vực Video Call */}
                <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            Đang kết nối tới máy chủ Video...
                        </div>
                    )}
                    <div id="jitsi-container" className="w-full h-full"></div>
                </div>
            </div>
        </AppLayout>
    );
}