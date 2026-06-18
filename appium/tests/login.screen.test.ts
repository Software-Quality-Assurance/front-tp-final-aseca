import {
  buildCredentials,
  loginWithCredentials,
  registerUserViaApi,
  waitForVisible,
} from '../helpers';

describe('Login screen', () => {
  it('loads the login screen and its primary elements', async () => {
    await waitForVisible('login-screen');
    await waitForVisible('login-email-input');
    await waitForVisible('login-password-input');
    await waitForVisible('login-submit-button');
    await waitForVisible('go-to-register-link');
  });

  it('logs in and redirects to portfolio', async () => {
    const credentials = buildCredentials('login_function');
    await registerUserViaApi(credentials);
    await loginWithCredentials(credentials);
    await waitForVisible('portfolio-screen');
  });
});
