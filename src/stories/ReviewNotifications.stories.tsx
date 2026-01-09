import type { Meta, StoryObj } from '@storybook/react';
import ReviewNotifications from '../components/home/ReviewNotifications';
import { useUserStore } from '../store/useUserStore';
import { useEffect } from 'react';

const meta: Meta<typeof ReviewNotifications> = {
    title: 'Home/ReviewNotifications',
    component: ReviewNotifications,
    decorators: [
        (Story) => (
            <div className="h-[500px] w-[400px] bg-base-50 p-4">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof ReviewNotifications>;

// Mock Data Generator
const generateReviewPlans = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `plan-${i}`,
        problemId: `p-${i}`,
        problemTitle: `테스트 문제 ${i + 1} - 스크롤 테스트용 긴 제목을 넣어봅시다`,
        platform: i % 2 === 0 ? 'BOJ' : 'PROG',
        difficulty: i % 2 === 0 ? 'Gold 5' : 'Level 2',
        currentStage: i % 5,
        nextReviewAt: new Date().toISOString(), // Due Now
        status: 'ACTIVE',
        lastCompletedAt: new Date(Date.now() - 86400000).toISOString(),
    }));
};

const StoreInitializer = ({ children, plans }: { children: React.ReactNode; plans: any[] }) => {
    useEffect(() => {
        // 백업
        const originalPlans = useUserStore.getState().reviewPlans;

        // Mock 데이터 주입
        useUserStore.setState({
            reviewPlans: plans as any
        });

        // Cleanup (선택 사항: 스토리 전환 시 원복하고 싶다면)
        return () => {
            useUserStore.setState({ reviewPlans: originalPlans });
        };
    }, [plans]);

    return <>{children}</>;
};

export const ScrollableList: Story = {
    render: (args) => (
        <StoreInitializer plans={generateReviewPlans(10)}>
            <ReviewNotifications {...args} />
        </StoreInitializer>
    ),
    args: {
        onPlanClick: (plan) => console.log('Clicked plan:', plan),
    },
};

export const Empty: Story = {
    render: (args) => (
        <StoreInitializer plans={[]}>
            <ReviewNotifications {...args} />
        </StoreInitializer>
    ),
    args: {
        onPlanClick: (plan) => console.log('Clicked plan:', plan),
    },
};
