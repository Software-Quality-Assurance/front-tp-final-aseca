import {
  createAuthenticatedSession,
  openTab,
  waitForVisible,
} from '../helpers';

describe('History screen', () => {
  it('loads the history screen and its primary elements', async () => {
    await createAuthenticatedSession('history_screen');
    await openTab('tab-history', 'history-screen');
    await waitForVisible('history-screen');
    await waitForVisible('history-content');
  });

  it('navigates from history back to portfolio using tabs', async () => {
    await createAuthenticatedSession('history_feature');
    await openTab('tab-history', 'history-screen');
    await openTab('tab-portfolio', 'portfolio-screen');
    await waitForVisible('portfolio-screen');
  });
});
