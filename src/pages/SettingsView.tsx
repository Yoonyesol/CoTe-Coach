import React from 'react';
import NicknameSection from '../components/settings/NicknameSection';
import SecuritySection from '../components/settings/SecuritySection';
import HelpSection from '../components/settings/HelpSection';
import DangerZone from '../components/settings/DangerZone';

interface SettingsViewProps {
    onDeleteAccountOpen: () => void;
    onContactOpen: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onDeleteAccountOpen, onContactOpen }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-base-900 font-sans tracking-tight">설정</h2>
                <p className="text-sm font-medium text-base-400 font-sans">계정 정보와 보안 설정을 관리할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-6">
                    <NicknameSection />
                    <SecuritySection />
                    <div className="block md:hidden">
                        <HelpSection onOpenContact={onContactOpen} />
                    </div>
                    <DangerZone onDeleteAccount={onDeleteAccountOpen} />
                </div>

                <div className="hidden md:block space-y-6">
                    <HelpSection onOpenContact={onContactOpen} />
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
