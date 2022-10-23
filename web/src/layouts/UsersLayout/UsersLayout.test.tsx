import { render } from '@redwoodjs/testing/web';

import UsersLayout from './UsersLayout';

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('UsersLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<UsersLayout />);
    }).not.toThrow();
  });
});
