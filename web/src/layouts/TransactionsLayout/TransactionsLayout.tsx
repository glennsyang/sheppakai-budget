import { Link, routes } from '@redwoodjs/router';
import { Toaster } from '@redwoodjs/web/toast';

type TransactionLayoutProps = {
  children: React.ReactNode;
};

const TransactionsLayout = ({ children }: TransactionLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link to={routes.transactions()} className="rw-link">
            Transactions
          </Link>
        </h1>
        <Link
          to={routes.newTransaction()}
          className="rw-button rw-button-green"
        >
          <div className="rw-button-icon">+</div> New Transaction
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  );
};

export default TransactionsLayout;
