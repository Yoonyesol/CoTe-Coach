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
    isOpen: boolean;
    options: ModalOptions | null;
    showAlert: (title: string, message: string, onConfirm?: () => void) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
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

export interface EditStudyLogModalProps extends CommonModalProps {
    log: StudyLog;
}

export interface ReviewModalProps extends CommonModalProps {
    problem: {
        title: string;
        platform: string;
        difficulty: string;
    };
}

export interface RecommendationSettingsModalProps extends CommonModalProps { }
