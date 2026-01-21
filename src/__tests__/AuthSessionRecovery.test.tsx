
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getSession: vi.fn(),
            signOut: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        }))
    }
}));

describe('useAuthStore 세션 복구 및 초기화 테스트', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        // Reset Zustand store state before each test
        useAuthStore.setState({
            user: null,
            session: null,
            isLoading: true,
            initialized: false
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('초기화(initialize)가 8초 이상 걸리면 타임아웃되어 초기화를 강제 완료해야 한다', async () => {
        // getSession이 영원히 응답하지 않는 상황 시뮬레이션
        (supabase.auth.getSession as any).mockReturnValue(new Promise(() => { }));

        const initPromise = useAuthStore.getState().initialize();

        // 8초 이상 시간을 흐르게 함
        vi.advanceTimersByTime(8001);

        await initPromise;

        const state = useAuthStore.getState();
        expect(state.initialized).toBe(true);
        expect(state.isLoading).toBe(false);
        expect(state.user).toBeNull();
    });

    it('화면이 다시 보일 때(visibilitychange) 세션을 재확인해야 한다', async () => {
        const mockSession = { user: { id: 'test-user' } };
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession } });

        // 초기화 수행
        await useAuthStore.getState().initialize();

        // visibilitychange 이벤트 발생 시뮬레이션
        Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });

        // 이벤트 리스너가 등록되었으므로 수동으로 트리거
        const event = new Event('visibilitychange');
        window.dispatchEvent(event);

        // getSession은 비동기로 실행되므로 잠시 대기
        await vi.runAllTimersAsync();

        const state = useAuthStore.getState();
        expect(supabase.auth.getSession).toHaveBeenCalled();
        expect(state.user).toEqual(mockSession.user);
    });
});
