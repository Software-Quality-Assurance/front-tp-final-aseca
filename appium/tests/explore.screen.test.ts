import {
  createAuthenticatedSession,
  openTab,
  searchCompany,
  waitForVisible,
} from '../helpers';

describe('Explore screen', () => {
  it('loads the explore screen and its primary elements', async () => {
    await createAuthenticatedSession('explore_screen');
    await openTab('tab-explore', 'explore-screen');
    await waitForVisible('explore-screen');
    await waitForVisible('company-search-input');
    await waitForVisible('company-search-button');
  });

  it('searches a company and shows financial metrics', async () => {
    await createAuthenticatedSession('explore_feature');
    await openTab('tab-explore', 'explore-screen');
    await searchCompany('ACLS');
    await waitForVisible('company-metrics-card');
  });
});
