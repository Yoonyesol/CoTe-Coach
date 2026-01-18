import type { Meta, StoryObj } from '@storybook/react';
import StatsEmptyState from '../components/stats/StatsEmptyState';

const meta: Meta<typeof StatsEmptyState> = {
    title: 'Stats/StatsEmptyState',
    component: StatsEmptyState,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatsEmptyState>;

export const Default: Story = {
    args: {
        onActionClick: () => alert('첫 문제 도전하러 가기 클릭!'),
    },
};
