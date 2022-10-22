import { MetaTags } from '@redwoodjs/web';

import ExpensesCell from 'src/components/ExpensesCell';

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      <ExpensesCell />
    </>
  );
};

export default HomePage;
