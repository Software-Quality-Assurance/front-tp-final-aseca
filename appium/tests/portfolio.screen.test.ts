import { createAuthenticatedSession, waitForVisible } from '../helpers';

describe('Portfolio screen', () => {
  it('loads the portfolio screen and its primary elements', async () => {
    await createAuthenticatedSession('portfolio_screen');
    await waitForVisible('portfolio-screen');
    await waitForVisible('portfolio-add-button');
    await waitForVisible('portfolio-current-value-link');
    await waitForVisible('portfolio-empty-state');
  });
});
