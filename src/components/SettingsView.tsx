import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useModalStore } from '../store/useModalStore';
import { User, Lock, Trash2, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsView: React.FC = () => {
    const { nickname, setNickname } = useUserStore();
    const { showAlert, showConfirm } = useModalStore();

    // 1. Nickname State
    const [nicknameInput, setNicknameInput] = useState(nickname || '');

    const handleSaveNickname = () => {
        if (!nicknameInput.trim()) return;
        if (nicknameInput.length > 15) {
            showAlert("닉네임 오류", "닉네임은 최대 15자까지 설정 가능합니다.");
            return;
        }
        setNickname(nicknameInput.trim());
        showAlert("프로필 업데이트", "닉네임이 성공적으로 변경되었습니다! 🎉");
    };

    // 2. Password State (Placeholder for now)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = () => {
        // TODO: Implement actual Supabase password update
        showAlert("준비 중", "비밀번호 변경 기능은 곧 업데이트될 예정입니다.");
    };

    // 3. Account Deletion
    const handleDeleteAccount = () => {
        showConfirm(
            "회원 탈퇴",
            "정말로 탈퇴하시겠습니까? 모든 학습 기록과 포인트가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
            () => {
                // TODO: Implement actual delete logic
                showAlert("준비 중", "회원 탈퇴 기능은 곧 업데이트될 예정입니다.");
            }
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-base-900 font-sans tracking-tight">설정</h2>
                <p className="text-sm font-medium text-base-400 font-sans">계정 정보와 보안 설정을 관리할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {/* Left Column: Navigation / Summary (Optional, sticking to single column list for now or split) */}
                {/* For simplicity as a start, we'll use a single wide column card layout */}

                <div className="md:col-span-2 space-y-6">
                    {/* 1. Profile Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-base-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center text-coral">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-base-900">프로필 설정</h3>
                                <p className="text-xs text-base-400 font-medium">다른 사용자에게 보여질 이름을 설정합니다.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans">
                                    닉네임
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={15}
                                        placeholder="별명을 설정해주세요 (최대 15자)"
                                        value={nicknameInput}
                                        onChange={(e) => setNicknameInput(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                                    />
                                    <button
                                        onClick={handleSaveNickname}
                                        disabled={!nicknameInput.trim() || nicknameInput === nickname}
                                        className="px-6 py-3 bg-base-900 text-white rounded-xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        저장
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Security Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-base-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-misty/10 rounded-xl flex items-center justify-center text-misty-dark">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-base-900">보안 설정</h3>
                                <p className="text-xs text-base-400 font-medium">비밀번호를 변경하여 계정을 보호하세요.</p>
                            </div>
                        </div>

                        <div className="space-y-4 opacity-50 pointer-events-none relative">
                            {/* Overlay for 'Coming Soon' if needed, or just disabled */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-full">
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                                        현재 비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        disabled
                                        className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                                        새 비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        disabled
                                        className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                                        새 비밀번호 확인
                                    </label>
                                    <input
                                        type="password"
                                        disabled
                                        className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleChangePassword}
                                    className="px-6 py-3 bg-misty-dark text-white rounded-xl font-black text-sm hover:bg-misty transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    비밀번호 변경
                                </button>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-base-900/80 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm">다음 단계에서 구현됩니다</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Danger Zone */}
                    <div className="bg-red-50/30 rounded-3xl p-8 shadow-sm border border-red-100/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-600">Danger Zone</h3>
                                <p className="text-xs text-red-400 font-medium">계정 삭제는 되돌릴 수 없습니다.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-100">
                            <div>
                                <p className="text-sm font-bold text-base-800">계정 삭제</p>
                                <p className="text-xs text-base-400">모든 데이터가 영구적으로 삭제됩니다.</p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-black hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                회원 탈퇴
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info / Help (Optional) */}
                <div className="hidden md:block space-y-6">
                    <div className="bg-gradient-to-br from-base-900 to-base-800 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-2">도움이 필요하신가요?</h3>
                            <p className="text-sm text-white/60 mb-6 leading-relaxed">
                                계정 설정이나 서비스 이용에 어려움이 있다면 언제든 문의해주세요.
                            </p>
                            <button className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                <ExternalLink size={14} />
                                문의하기
                            </button>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;
