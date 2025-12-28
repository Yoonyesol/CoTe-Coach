import type { Preview } from "@storybook/react";
import "../src/index.css"; // Tailwind 스타일 적용

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
