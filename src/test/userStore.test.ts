import { calculateEarnedXp, useUserStore } from '../store/useUserStore';

describe('통합 등급 시스템 및 XP 로직 테스트', () => {

    describe('calculateEarnedXp 함수', () => {
        test('백준(BOJ) 골드 문제 해결 시 30xp를 반환해야 함', () => {
            expect(calculateEarnedXp('BOJ', '11')).toBe(30);
            expect(calculateEarnedXp('BOJ', '15')).toBe(30);
        });

        test('프로그래머스(PROG) Lv.3 문제 해결 시 50xp를 반환해야 함', () => {
            expect(calculateEarnedXp('PROG', '3')).toBe(50);
        });

        test('SWEA D4 문제 해결 시 30xp를 반환해야 함', () => {
            expect(calculateEarnedXp('SWEA', 'D4')).toBe(30);
        });
    });

    describe('useUserStore 레벨업 로직', () => {
        beforeEach(() => {
            useUserStore.setState({ xp: 0, level: 1, tier: 'Novice 1' });
        });

        test('100xp 이상 획득 시 레벨이 2로 증가해야 함', () => {
            const { addXp } = useUserStore.getState();
            addXp(150);

            const state = useUserStore.getState();
            expect(state.level).toBe(2);
            expect(state.xp).toBe(150);
        });

        test('레벨 11 달성 시 티어가 Challenger 1로 변경되어야 함', () => {
            const { addXp } = useUserStore.getState();
            addXp(1000);

            const state = useUserStore.getState();
            expect(state.level).toBe(11);
            expect(state.tier).toBe('Challenger 1');
        });
    });
});
