import { create } from 'zustand';

import { ModalState } from '../types/modal';

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
