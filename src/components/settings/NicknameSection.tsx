import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { useAuthStore } from '../../store/useAuthStore';

const NicknameSection: React.FC = () => {
    const { nickname, setNickname } = useUserStore();
    const { user } = useAuthStore();
    const { showAlert } = useModalStore();

    // Default to email prefix if nickname is not set
    const initialNickname = nickname || (user?.email ? user.email.split('@')[0] : '');
    const [nicknameInput, setNicknameInput] = useState(initialNickname);

    const handleSaveNickname = () => {
        if (!nicknameInput.trim()) return;
        if (nicknameInput.length > 15) {
            showAlert("닉네임 오류", "닉네임은 최대 15자까지 설정 가능합니다.");
            return;
        }
        setNickname(nicknameInput.trim());
        showAlert("프로필 업데이트", "닉네임이 성공적으로 변경되었습니다! 🎉");
    };

    return (
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
                    <div className="space-y-3">
                        <input
                            type="text"
                            maxLength={15}
                            placeholder="별명을 설정해주세요 (최대 15자)"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-coral/50 transition-all text-sm font-bold placeholder:text-base-300 outline-none"
                        />
                        <button
                            onClick={handleSaveNickname}
                            disabled={!nicknameInput.trim() || nicknameInput === nickname}
                            className="w-full px-6 py-3 bg-base-900 text-white rounded-xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NicknameSection;
