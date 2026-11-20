
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './tests',
    timeout: 60000,

    use: {
        baseURL: process.env.BASE_URL,

        headless: false,

        // Maximize browser window
        viewport: null,

        launchOptions: {
            args: ['--start-maximized']
        },

        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
    },

    reporter: [['html', { open: 'never' }]]
});
