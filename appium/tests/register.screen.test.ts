import {
  buildCredentials,
  openRegisterScreen,
  registerWithUi,
  waitForAny,
  waitForVisible,
} from '../helpers';

describe('Register screen', () => {
  it('loads the register screen and its primary elements', async () => {
    await openRegisterScreen();
    await waitForVisible('register-email-input');
    await waitForVisible('register-password-input');
    await waitForVisible('register-submit-button');
    await waitForVisible('go-to-login-link');
  });

  it('registers a new account and returns to login', async () => {
    const credentials = buildCredentials('register_function');
    await registerWithUi(credentials);
    await waitForAny(['register-success-message', 'login-screen']);
    await waitForVisible('login-screen');
  });
});
