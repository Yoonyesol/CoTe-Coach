import React, { Suspense } from 'react';
import { useModalStore } from '../../store/useModalStore';

// Modals
import AddProblemModal from './AddProblemModal';
import AccountSettingsModal from './AccountSettingsModal';
import TierGuideModal from './TierGuideModal';
import ReviewModal from './ReviewModal';
import ReviewDetailModal from './ReviewDetailModal';
import DailyGoalSettingsModal from './DailyGoalSettingsModal';
import DeleteAccountModal from './DeleteAccountModal';
import ContactModal from './ContactModal';
import EditTaskModal from './EditTaskModal';
import StudyLogDetailModal from './StudyLogDetailModal';
import GoalModal from './GoalModal';
import { Loader2 } from 'lucide-react';

export default function GlobalModalRenderer() {
    const { activeGlobalModal, globalModalProps, closeGlobalModal } = useModalStore();

    if (!activeGlobalModal) return null;

    return (
        <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
            {activeGlobalModal === 'ADD_PROBLEM' && (
                <AddProblemModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'ACCOUNT_SETTINGS' && (
                <AccountSettingsModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'TIER_GUIDE' && (
                <TierGuideModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'REVIEW' && (
                <ReviewModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'REVIEW_DETAIL' && (
                <ReviewDetailModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'DAILY_GOAL' && (
                <DailyGoalSettingsModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'DELETE_ACCOUNT' && (
                <DeleteAccountModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'CONTACT' && (
                <ContactModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'EDIT_TASK' && (
                <EditTaskModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'STUDY_LOG_DETAIL' && (
                <StudyLogDetailModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
            {activeGlobalModal === 'GOAL' && (
                <GoalModal isOpen={true} onClose={closeGlobalModal} {...globalModalProps} />
            )}
        </Suspense>
    );
}
