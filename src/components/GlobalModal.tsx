import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../store/useModalStore';
import { AlertCircle, HelpCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

const GlobalModal: React.FC = () => {
    const { isOpen, options, closeModal } = useModalStore();

    // Prevent background scrolling when modal is open
    useEffect(() => {
        const mainElement = document.querySelector('main');
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (mainElement) mainElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            if (mainElement) mainElement.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            if (mainElement) mainElement.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!options) return null;

    const { title, message, type, onConfirm, onCancel, confirmText, cancelText } = options;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeModal();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-base-900/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl overflow-hidden font-sans"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className={clsx(
                                "w-16 h-16 rounded-3xl flex items-center justify-center mb-6",
                                type === 'alert' ? "bg-red-50 text-red-500" : "bg-misty/10 text-misty-dark"
                            )}>
                                {type === 'alert' ? <AlertCircle size={32} /> : <HelpCircle size={32} />}
                            </div>

                            {title && (
                                <h3 className="text-xl font-black text-base-900 mb-2 tracking-tight">
                                    {title}
                                </h3>
                            )}
                            <p className="text-base-500 font-bold leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex w-full gap-3">
                                {type === 'confirm' && (
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-4 rounded-2xl bg-base-50 text-base-500 font-black hover:bg-base-100 transition-all active:scale-95 cursor-pointer"
                                    >
                                        {cancelText || '취소'}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-black/5 cursor-pointer",
                                        type === 'alert'
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-base-900 text-white hover:bg-base-800"
                                    )}
                                >
                                    {confirmText || '확인'}
                                </button>
                            </div>
                        </div>

                        {/* Close button (top right) */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-6 right-6 text-base-300 hover:text-base-900 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalModal;
