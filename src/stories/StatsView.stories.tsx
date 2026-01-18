import type { Meta, StoryObj } from '@storybook/react';
import StatsView from '../pages/StatsView';
import { useUserStore } from '../store/useUserStore';
import React, { useEffect } from 'react';

const meta: Meta<typeof StatsView> = {
    title: 'Pages/StatsView',
    component: StatsView,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof StatsView>;

// Helper to wrap component and set store state
const StoreStateDecorator = (logs: any[], plans: any[] = []) => (Story: any) => {
    useEffect(() => {
        const prevState = {
            studyLogs: useUserStore.getState().studyLogs,
            reviewPlans: useUserStore.getState().reviewPlans,
        };

        useUserStore.setState({
            studyLogs: logs,
            reviewPlans: plans
        });

        // Cleanup to restore original state when unmounting
        return () => {
            useUserStore.setState(prevState);
        };
    }, []);
    return <div className="p-8 bg-slate-50 min-h-screen"><Story /></div>;
};

export const Empty: Story = {
    decorators: [StoreStateDecorator([], [])],
};

export const WithData: Story = {
    decorators: [
        StoreStateDecorator([
            { id: '1', problemId: '1000', problemTitle: 'A+B', platform: 'BOJ', difficulty: 'Bronze V', result: 'SUCCESS', completedAt: new Date().toISOString(), elapsedTime: 60000, stage: 0, concepts: ['기초', '수학'] },
            { id: '2', problemId: '1001', problemTitle: 'A-B', platform: 'BOJ', difficulty: 'Bronze V', result: 'SUCCESS', completedAt: new Date().toISOString(), elapsedTime: 120000, stage: 0, concepts: ['기초'] },
            { id: '3', problemId: '1920', problemTitle: '수 찾기', platform: 'BOJ', difficulty: 'Silver IV', result: 'SUCCESS', completedAt: new Date().toISOString(), elapsedTime: 300000, stage: 1, concepts: ['이분 탐색'] },
        ], [
            { problemId: '1920', problemTitle: '수 찾기', platform: 'BOJ', currentStage: 1, status: 'ACTIVE', nextReviewAt: new Date().toISOString() }
        ])
    ],
};
