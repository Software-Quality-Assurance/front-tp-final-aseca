import {
  createAuthenticatedSession,
  openCurrentValueScreen,
  tap,
  waitForVisible,
} from '../helpers';

describe('Current Value screen', () => {
  it('loads the current value screen and its primary elements', async () => {
    await createAuthenticatedSession('current_value_screen');
    await openCurrentValueScreen();
    await waitForVisible('current-value-screen');
    await waitForVisible('current-value-content');
  });

  it('opens current value from the portfolio shortcut', async () => {
    await createAuthenticatedSession('current_value_feature');
    await tap('portfolio-current-value-link');
    await waitForVisible('current-value-screen');
  });
});
