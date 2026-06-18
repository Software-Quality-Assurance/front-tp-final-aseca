import {
  createAuthenticatedSession,
  logoutFromProfile,
  openTab,
  waitForVisible,
} from '../helpers';

describe('Profile screen', () => {
  it('loads the profile screen and its primary elements', async () => {
    await createAuthenticatedSession('profile_screen');
    await openTab('tab-profile', 'profile-screen');
    await waitForVisible('profile-screen');
    await waitForVisible('profile-email-input');
    await waitForVisible('profile-password-input');
    await waitForVisible('profile-save-button');
    await waitForVisible('profile-logout-button');
  });

  it('logs out from the profile screen', async () => {
    await createAuthenticatedSession('profile_feature');
    await logoutFromProfile();
    await waitForVisible('login-screen');
  });
});
