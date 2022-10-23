import AppLayout from './AppLayout';

export const loggedIn = () => {
  mockCurrentUser({ email: 'glenn@sheppakai.com' });

  return <AppLayout />;
};

export const loggedOut = () => {
  return <AppLayout />;
};

export default { title: 'Layouts/AppLayout' };
