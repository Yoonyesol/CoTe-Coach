import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, Mail, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../../store/useModalStore';
import emailjs from '@emailjs/browser';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const { showAlert } = useModalStore();
    useLockBodyScroll(isOpen);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            showAlert("입력 확인", "문의 제목과 내용을 입력해 주세요.");
            return;
        }

        setIsLoading(true);

        try {
            // EmailJS integration
            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
                console.log("EmailJS keys are not set correctly in .env. Data to send:", formData);
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await emailjs.send(
                    SERVICE_ID,
                    TEMPLATE_ID,
                    {
                        title: formData.title,
                        name: formData.name || '익명 사용자',
                        message: formData.message,
                        time: new Date().toLocaleString('ko-KR'),
                        reply_to: formData.email // template에 {{reply_to}}가 있다면 사용 가능
                    },
                    PUBLIC_KEY
                );
            }

            showAlert("문의 완료", "소중한 의견 감사합니다. 최대한 빨리 확인 후 답변 드릴게요! 💌");
            setFormData({ name: '', email: '', title: '', message: '' });
            onClose();
        } catch (error) {
            console.error('EmailJS Error:', error);
            showAlert("전송 실패", "메일 전송 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const modalVariants = getModalVariants(isMobile);


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm cursor-pointer"
                        onClick={onClose}
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-card w-full max-w-lg bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center text-coral">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-base-900 font-sans">문의하기</h2>
                                    <p className="text-xs text-base-400 font-medium">서비스 개선을 위한 어떤 의견이든 환영합니다.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">작성자 (선택)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="성함 또는 닉네임"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">회신 이메일 (선택)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="reply@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">문의 제목</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="어떤 점이 궁금하신가요?"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">문의 내용</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-base-300" />
                                    <textarea
                                        name="message"
                                        placeholder="버그 리포트, 제안 사항, 합격 수기 등 자유롭게 남겨주세요."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold min-h-[150px] resize-none outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-base-100 text-base-600 rounded-2xl font-black text-sm hover:bg-base-200 transition-all active:scale-95"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] py-4 bg-base-900 text-white rounded-2xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-base-900/10"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            전송하기
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;
