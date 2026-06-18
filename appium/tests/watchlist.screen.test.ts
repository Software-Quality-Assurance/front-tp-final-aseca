import {
  createAuthenticatedSession,
  openTab,
  waitForVisible,
} from '../helpers';

describe('Watchlist screen', () => {
  it('loads the watchlist screen and its primary elements', async () => {
    await createAuthenticatedSession('watchlist_screen');
    await openTab('tab-watchlist', 'watchlist-screen');
    await waitForVisible('watchlist-screen');
    await waitForVisible('compare-button');
    await waitForVisible('add-watchlist-button');
    await waitForVisible('watchlist-empty-state');
  });
});
