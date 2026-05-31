import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: true,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:8081',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    setupNodeEvents(on, config) {},
    env: {
      apiUrl: process.env.CYPRESS_API_URL ?? 'http://localhost:8080',
    },
  },
});
