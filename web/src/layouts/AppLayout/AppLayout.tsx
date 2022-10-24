import { useAuth } from '@redwoodjs/auth';
import { Link, routes } from '@redwoodjs/router';
import { Toaster } from '@redwoodjs/web/toast';

type AppLayoutProps = {
  children?: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, currentUser, logOut, hasRole } = useAuth();

  return (
    <>
      <Toaster />
      <header className="relative flex items-center justify-between bg-blue-700 py-4 px-8 text-white">
        <h1 className="text-5xl font-semibold tracking-tight">
          <Link
            className="text-blue-400 transition duration-100 hover:text-blue-100"
            to={routes.home()}
          >
            Sheppakai Budget
          </Link>
        </h1>
        <nav>
          <ul className="relative flex items-center font-light">
            <li>
              <Link
                className="rounded py-2 px-4 transition duration-100 hover:bg-blue-600"
                to={routes.about()}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="rounded py-2 px-4 transition duration-100 hover:bg-blue-600"
                to={routes.contact()}
              >
                Contact
              </Link>
            </li>
            {isAuthenticated && hasRole('admin') ? (
              <li>
                <Link
                  className="rounded py-2 px-4 transition duration-100 hover:bg-blue-600"
                  to={routes.transactions()}
                >
                  Admin
                </Link>
              </li>
            ) : null}
            <li>
              {isAuthenticated ? (
                <div>
                  <button type="button" onClick={logOut} className="py-2 px-4">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to={routes.login()} className="py-2 px-4">
                  Login
                </Link>
              )}
            </li>
          </ul>
          {isAuthenticated && (
            <div className="absolute bottom-1 right-0 mr-12 text-xs text-blue-300">
              {currentUser.email}
            </div>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl rounded-b bg-white p-12 shadow">
        {children}
      </main>
    </>
  );
};

export default AppLayout;
