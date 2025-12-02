import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, X } from 'lucide-react';
import axios from 'axios';

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/ai-chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Lỗi kết nối AI.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="mb-4 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden flex flex-col h-96">
                    <div className="bg-black p-3 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-semibold">Trợ lý ảo</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X className="h-4 w-4" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                Xin chào! Tôi có thể giúp gì cho bạn?
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                    m.role === 'user' 
                                    ? 'bg-black text-white' 
                                    : 'bg-white border text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-gray-500 italic">Đang suy nghĩ...</div>}
                    </div>

                    <form onSubmit={handleSend} className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-2">
                        <Input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder="Hỏi gì đó..." 
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Nút Bật/Tắt */}
            {!isOpen && (
                <Button 
                    onClick={() => setIsOpen(true)} 
                    className="h-14 w-14 rounded-full shadow-xl bg-black hover:bg-gray-800 text-white"
                >
                    <Bot className="h-7 w-7" />
                </Button>
            )}
        </div>
    );
}