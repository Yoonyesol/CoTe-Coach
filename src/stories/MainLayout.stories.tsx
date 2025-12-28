import type { Meta, StoryObj } from '@storybook/react';
import MainLayout from '../components/layout/MainLayout';
import React from 'react';

const meta: Meta<typeof MainLayout> = {
    title: 'Layout/MainLayout',
    component: MainLayout,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const Default: Story = {
    args: {
        children: (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Storybook Test</h1>
                <p>MainLayout이 스토리북에서 잘 보이는지 테스트 중입니다.</p>
            </div>
        ),
    },
};
