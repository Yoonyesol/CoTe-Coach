import React from 'react';

interface DangerZoneProps {
    onDeleteAccount: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onDeleteAccount }) => {
    return (
        <div className="pt-4 border-t border-base-100">
            <button
                onClick={onDeleteAccount}
                className="text-xs text-base-400 hover:text-red-500 underline underline-offset-2 transition-colors cursor-pointer"
            >
                회원 탈퇴
            </button>
        </div>
    );
};

export default DangerZone;
