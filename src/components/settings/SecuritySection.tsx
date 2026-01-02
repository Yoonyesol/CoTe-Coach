import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { validatePassword } from '../../lib/validation';

const SecuritySection: React.FC = () => {
    const { verifyCurrentPassword, updatePassword } = useAuthStore();
    const { showAlert } = useModalStore();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!validatePassword(newPassword)) {
            showAlert("비밀번호 오류", "새 비밀번호는 8자 이상이며, 영문/숫자/특수문자(@$!%*#?&)를 각각 최소 하나씩 포함해야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert("비밀번호 오류", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error: verifyError } = await verifyCurrentPassword(currentPassword);
            if (verifyError) {
                showAlert("인증 실패", "현재 비밀번호가 올바르지 않습니다.");
                setIsChangingPassword(false);
                return;
            }

            const { error: updateError } = await updatePassword(newPassword);
            if (updateError) {
                showAlert("변경 실패", updateError.message || "비밀번호 변경 중 오류가 발생했습니다.");
                setIsChangingPassword(false);
                return;
            }

            showAlert("비밀번호 변경 완료", "비밀번호가 성공적으로 변경되었습니다! 🔒");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            showAlert("오류 발생", "비밀번호 변경 중 예기치 않은 오류가 발생했습니다.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
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

            <div className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                            현재 비밀번호
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="현재 비밀번호 입력"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-base-400 hover:text-misty-dark transition-colors"
                            >
                                {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                            새 비밀번호
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="8자 이상, 영문/숫자/특수문자"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-base-400 hover:text-misty-dark transition-colors"
                            >
                                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {newPassword && !validatePassword(newPassword) && (
                            <p className="text-[10px] text-coral font-bold mt-1">8자 이상, 영문/숫자/특수문자(@$!%*#?&) 포함 필수</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans block mb-2">
                            새 비밀번호 확인
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="새 비밀번호 재입력"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-base-400 hover:text-misty-dark transition-colors"
                            >
                                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-[10px] text-coral font-bold mt-1">비밀번호가 일치하지 않습니다.</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="px-6 py-3 bg-misty-dark text-white rounded-xl font-black text-sm hover:bg-misty transition-all active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySection;
