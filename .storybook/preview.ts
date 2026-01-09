import React from 'react';
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "../src/index.css"; // Tailwind 스타일 적용

const queryClient = new QueryClient();

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [
        (Story) => (
            React.createElement(QueryClientProvider, { client: queryClient },
                React.createElement(Story)
            )
        ),
    ],
};

export default preview;
