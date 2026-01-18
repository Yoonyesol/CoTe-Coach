import { StudyLog } from './study';

export interface ModalOptions {
    title?: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export interface ModalState {
    isOpen: boolean; // Alert/Confirm modal
    options: ModalOptions | null;
    isShopOpen: boolean;
    isRecommendationSettingsOpen: boolean;
    shopInitialCategory?: 'ACCESSORY' | 'CLOTHES' | 'FURNITURE' | 'DECO' | 'WALLPAPER' | 'INVENTORY';
    showAlert: (title: string, message: string, onConfirm?: () => void) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
    openShop: (category?: 'ACCESSORY' | 'CLOTHES' | 'FURNITURE' | 'DECO' | 'WALLPAPER' | 'INVENTORY') => void;
    closeShop: () => void;
    openRecommendationSettings: () => void;
    closeRecommendationSettings: () => void;
    closeModal: () => void;
}

// Component Props Interfaces
export interface CommonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface AddProblemModalProps extends CommonModalProps { }
export interface AccountSettingsModalProps extends CommonModalProps { }
export interface StudyPlanModalProps extends CommonModalProps { }
export interface StudyPlanDetailModalProps extends CommonModalProps {
    onEditPlan: () => void;
}
export interface TierGuideModalProps extends CommonModalProps { }
export interface DifficultyGuideModalProps extends CommonModalProps { }
export interface ShopModalProps extends CommonModalProps { }

export interface StudyLogDetailModalProps extends CommonModalProps {
    log: StudyLog;
}

export interface ReviewModalProps extends CommonModalProps {
    problem: {
        id?: string;
        title: string;
        platform: string;
        difficulty: string;
    };
}

export interface ReviewDetailModalProps extends CommonModalProps {
    plan: any; // ReviewPlan type
    onStartReview: (plan: any) => void;
    onQuickLog: (plan: any) => void;
    onViewFullDetail: (log: StudyLog) => void;
}

export interface RecommendationSettingsModalProps extends CommonModalProps { }
