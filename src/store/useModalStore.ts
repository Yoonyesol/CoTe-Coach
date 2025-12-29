import { create } from 'zustand';

interface ModalOptions {
    title?: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ModalState {
    isOpen: boolean;
    options: ModalOptions | null;
    showAlert: (title: string, message: string, onConfirm?: () => void) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    options: null,
    showAlert: (title, message, onConfirm) => set({
        isOpen: true,
        options: { title, message, type: 'alert', onConfirm, confirmText: '확인' }
    }),
    showConfirm: (title, message, onConfirm, onCancel) => set({
        isOpen: true,
        options: {
            title,
            message,
            type: 'confirm',
            onConfirm,
            onCancel,
            confirmText: '확인',
            cancelText: '취소'
        }
    }),
    closeModal: () => set({ isOpen: false, options: null })
}));
