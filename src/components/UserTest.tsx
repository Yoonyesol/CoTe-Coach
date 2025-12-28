import React, { useState } from 'react';
import { useSolvedAcUser } from '../hooks/useSolvedAc';

const UserTest = () => {
    const [handle, setHandle] = useState('');
    const [searchHandle, setSearchHandle] = useState('');

    const { data, isLoading, isError, error } = useSolvedAcUser(searchHandle);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchHandle(handle);
    };

    return (
        <div className="glass-card p-8 space-y-4">
            <h2 className="text-xl font-black text-base-800">Solved.ac 연동 테스트 🧪</h2>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="백준 핸들을 입력하세요 (예: koosaga)"
                    className="flex-1 px-4 py-2 rounded-xl bg-white border border-base-200 focus:outline-none focus:ring-2 focus:ring-misty"
                />
                <button type="submit" className="game-button bg-misty text-white py-2">검색</button>
            </form>

            {isLoading && <p className="text-base-500 animate-pulse">데이터를 가져오는 중...</p>}

            {isError && (
                <p className="text-coral-dark font-bold">
                    에러 발생: {(error as Error).message}
                </p>
            )}

            {data && (
                <div className="p-4 bg-sage-light rounded-2xl border border-sage animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🏅</div>
                        <div>
                            <p className="text-sm text-base-500 font-bold uppercase">사용자 핸들</p>
                            <p className="text-lg font-black text-base-800">{data.handle}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white/50 p-3 rounded-xl">
                            <p className="text-xs text-base-400 font-bold">티어 (숫자)</p>
                            <p className="text-xl font-black text-misty-dark">Lv. {data.tier}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-xl">
                            <p className="text-xs text-base-400 font-bold">해결한 문제</p>
                            <p className="text-xl font-black text-sage-dark">{data.solvedCount}개</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTest;
