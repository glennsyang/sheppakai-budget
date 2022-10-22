// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Private, Route, Router, Set } from '@redwoodjs/router';

import AppLayout from 'src/layouts/AppLayout';
import TransactionsLayout from 'src/layouts/TransactionsLayout';

const Routes = () => {
  return (
    <Router>
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Private unauthenticated="home">
        <Set wrap={TransactionsLayout} title="Transactions" titleTo="transactions" buttonLabel="New Transaction" buttonTo="newTransaction">
          <Route path="/admin/transactions/new" page={TransactionNewTransactionPage} name="newTransaction" />
          <Route path="/admin/transactions/{id:Int}/edit" page={TransactionEditTransactionPage} name="editTransaction" />
          <Route path="/admin/transactions/{id:Int}" page={TransactionTransactionPage} name="transaction" />
          <Route path="/admin/transactions" page={TransactionTransactionsPage} name="transactions" />
        </Set>
      </Private>
      <Set wrap={AppLayout}>
        <Route path="/expense/{id:Int}" page={ExpensePage} name="expense" />
        <Route path="/contact" page={ContactPage} name="contact" />
        <Route path="/about" page={AboutPage} name="about" />
        <Route path="/" page={HomePage} name="home" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  );
};

export default Routes;
