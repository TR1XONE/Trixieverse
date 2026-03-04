import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minus, ChevronUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    role: 'user' | 'model';
    content: string;
}

const ACCESS_TOKEN_KEY = 'auth_access_token';

export default function AdminChatWindow() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: '👾 Admin AI online. What do you need?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Only render for ADMIN
    if (!user || user.role !== 'ADMIN') return null;

    // Auto-scroll to latest message
    useEffect(() => {
        if (open && !minimized) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open, minimized]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            const res = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'model', content: `⚠️ Error: ${data.error || 'Something went wrong'}` },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'model', content: '⚠️ Network error. Is the backend running?' },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            {!open && (
                <button
                    id="admin-chat-toggle"
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        boxShadow: '0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(6,182,212,0.2)',
                    }}
                    title="Admin AI Chat"
                >
                    <Bot className="w-7 h-7 text-white" />
                    {/* Pulse ring */}
                    <span className="absolute w-full h-full rounded-full animate-ping opacity-30 bg-cyan-400" />
                </button>
            )}

            {/* Chat window */}
            {open && (
                <div
                    id="admin-chat-window"
                    className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        width: 380,
                        maxHeight: minimized ? 56 : 560,
                        transition: 'max-height 0.3s cubic-bezier(0.23,1,0.32,1)',
                        background: 'linear-gradient(to bottom, #0d1117, #0a0f1a)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        boxShadow: '0 0 40px rgba(6,182,212,0.15), 0 25px 60px rgba(0,0,0,0.8)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer select-none"
                        style={{ borderBottom: minimized ? 'none' : '1px solid rgba(6,182,212,0.15)', background: 'linear-gradient(to right, rgba(6,182,212,0.1), rgba(59,130,246,0.1))' }}
                        onClick={() => setMinimized((m) => !m)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bot className="w-5 h-5 text-cyan-400" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" />
                            </div>
                            <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Admin AI</span>
                            <span className="text-xs text-white/20 font-mono">• Gemini</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMinimized((m) => !m); }}
                                className="p-1 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
                            >
                                {minimized ? <ChevronUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                                className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {!minimized && (
                        <>
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0, maxHeight: 420 }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                                            style={
                                                msg.role === 'user'
                                                    ? { background: 'linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.25))', border: '1px solid rgba(6,182,212,0.3)', color: '#e2e8f0' }
                                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }
                                            }
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(6,182,212,0.1)' }}>
                                <div className="flex items-end gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.2)' }}>
                                    <textarea
                                        ref={inputRef}
                                        id="admin-chat-input"
                                        rows={1}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask anything... (Enter to send)"
                                        className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-white/20 outline-none resize-none"
                                        style={{ maxHeight: 80, overflowY: 'auto' }}
                                        autoFocus
                                    />
                                    <button
                                        id="admin-chat-send"
                                        onClick={send}
                                        disabled={!input.trim() || loading}
                                        className="p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30"
                                        style={{ background: 'rgba(6,182,212,0.2)', color: '#06b6d4' }}
                                        aria-label="Send message"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-white/15 mt-1.5 font-mono">SHIFT+ENTER for newline</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
