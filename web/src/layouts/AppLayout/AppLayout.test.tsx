import { render, screen, waitFor } from '@redwoodjs/testing';

import AppLayout from './AppLayout';

const EMAIL = 'glenn@sheppakai.com';
const loggedIn = () => {
  mockCurrentUser({ email: EMAIL });
};
const loggedOut = () => {
  mockCurrentUser(null);
};

describe('AppLayout', () => {
  it('displays a Login link when not logged in', async () => {
    loggedOut();
    render(<AppLayout />);

    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
  });

  it('displays a Logout link when logged in', async () => {
    loggedIn();
    render(<AppLayout />);

    await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());
  });

  it("displays a logged in user's email address", async () => {
    loggedIn();
    render(<AppLayout />);

    await waitFor(() => expect(screen.getByText(EMAIL)).toBeInTheDocument());
  });
});
