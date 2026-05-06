import { create } from 'zustand';

import { ModalState } from '../types/modal';

export const useModalStore = create<ModalState>((set) => ({
    activeGlobalModal: null,
    globalModalProps: {},
    openGlobalModal: (type, props) => set({ activeGlobalModal: type, globalModalProps: props || {} }),
    closeGlobalModal: () => set({ activeGlobalModal: null, globalModalProps: {} }),
    
    isOpen: false,
    options: null,
    isShopOpen: false,
    isRecommendationSettingsOpen: false,
    isRewardedAdModalOpen: false,
    isGoldHistoryOpen: false,
    shopInitialCategory: undefined,
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
    openShop: (category) => set({ isShopOpen: true, shopInitialCategory: category }),
    closeShop: () => set({ isShopOpen: false, shopInitialCategory: undefined }),
    openRecommendationSettings: () => set({ isRecommendationSettingsOpen: true }),
    closeRecommendationSettings: () => set({ isRecommendationSettingsOpen: false }),
    openRewardedAdModal: () => set({ isRewardedAdModalOpen: true }),
    closeRewardedAdModal: () => set({ isRewardedAdModalOpen: false }),
    openGoldHistory: () => set({ isGoldHistoryOpen: true }),
    closeGoldHistory: () => set({ isGoldHistoryOpen: false }),
    closeModal: () => set({ isOpen: false, options: null })
}));
