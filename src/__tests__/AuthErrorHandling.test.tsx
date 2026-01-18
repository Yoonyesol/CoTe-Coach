
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useModalStore } from '../store/useModalStore';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(),
            signOut: vi.fn()
        }
    }
}));

// Create mocks inside factories
vi.mock('../store/useAuthStore', () => {
    const mock = vi.fn();
    (mock as any).getState = vi.fn();
    return { useAuthStore: mock };
});

vi.mock('../store/useUserStore', () => {
    const mock = vi.fn();
    (mock as any).getState = vi.fn();
    (mock as any).persist = {
        hasHydrated: vi.fn().mockReturnValue(true),
        onFinishHydration: vi.fn(),
    };
    return { useUserStore: mock };
});

vi.mock('../store/useModalStore', () => ({
    useModalStore: vi.fn()
}));

vi.mock('../components/layout/MainLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

// Mock all modals and components to isolate App logic and avoid import errors (e.g. from API calls in children)
vi.mock('../components/modals/AddProblemModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/AccountSettingsModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/TierGuideModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/ReviewModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/ReviewDetailModal', () => ({ default: () => <div /> }));
vi.mock('../components/common/Stopwatch', () => ({ default: () => <div /> }));
vi.mock('../components/modals/StudyLogDetailModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/RecommendationSettingsModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/GlobalModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/GoalModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/DailyGoalSettingsModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/DeleteAccountModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/ContactModal', () => ({ default: () => <div /> }));
vi.mock('../components/modals/ShopModal', () => ({ default: () => <div /> }));

// Mock lazy components to avoid suspense issues in tests
vi.mock('../pages/HomeView', () => ({ default: () => <div>Home View</div> }));
vi.mock('../pages/LandingView', () => ({ default: () => <div>Landing View</div> }));

describe('App.tsx 인증 에러 핸들링', () => {
    const mockSignOut = vi.fn();
    const mockShowAlert = vi.fn();
    const mockFetchUserData = vi.fn();
    const mockFetchGoals = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Auth Store using imported mock
        (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { id: 'test-user' },
            initialize: vi.fn(),
            isLoading: false,
            initialized: true,
            signOut: mockSignOut
        });

        // Setup static getState for direct calls
        (useAuthStore as any).getState.mockReturnValue({
            signOut: mockSignOut
        });

        // Setup User Store using imported mock
        (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            fetchUserData: mockFetchUserData,
            fetchGoals: mockFetchGoals,
            refreshRating: vi.fn(),
            calculateTier: vi.fn().mockReturnValue('Bronze 5'),
            tier: 'Bronze 5',
            // Mocking these simple values is enough for App.tsx render
            level: 1,
            timer: {},
            getActiveGoal: vi.fn(),
        });

        // Setup User Store static methods
        const userStoreMock = useUserStore as unknown as ReturnType<typeof vi.fn> & { getState: ReturnType<typeof vi.fn>, persist: any };
        userStoreMock.getState.mockReturnValue({
            calculateTier: vi.fn().mockReturnValue('Bronze 5'),
            tier: 'Bronze 5',
            level: 1
        });
        userStoreMock.persist.hasHydrated.mockReturnValue(true);

        // Setup Modal Store using imported mock
        (useModalStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            showAlert: mockShowAlert,
            isShopOpen: false,
            closeShop: vi.fn(),
            isRecommendationSettingsOpen: false,
            openRecommendationSettings: vi.fn(),
            closeRecommendationSettings: vi.fn()
        });
    });

    test('데이터 동기화 중 401 인증 에러 발생 시 로그아웃을 트리거해야 한다', async () => {
        // Arrange: valid user but fetchUserData fails with 401
        mockFetchUserData.mockRejectedValue({ status: 401, message: 'Unauthorized' });

        // Act
        render(<App />);

        // Assert
        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
        });
        expect(mockShowAlert).not.toHaveBeenCalled(); // Should handle silently/redirect, not alert
    });

    test('네트워크 에러(예: 500) 발생 시 로그아웃하지 않고 경고창을 띄워야 한다', async () => {
        // Arrange: fetchUserData fails with 500
        mockFetchUserData.mockRejectedValue({ status: 500, message: 'Server Error' });

        // Act
        render(<App />);

        // Assert
        await waitFor(() => {
            expect(mockSignOut).not.toHaveBeenCalled();
            expect(mockShowAlert).toHaveBeenCalledWith(
                "데이터 동기화 실패",
                expect.stringContaining("네트워크 연결을 확인해주세요")
            );
        });
    });

    test('JWT 관련 에러 메시지를 인증 에러로 처리해야 한다', async () => {
        // Arrange: fetchUserData fails with arbitrary error containing "JWT"
        mockFetchUserData.mockRejectedValue({ message: 'Invalid JWT token' });

        // Act
        render(<App />);

        // Assert
        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
        });
    });
});
