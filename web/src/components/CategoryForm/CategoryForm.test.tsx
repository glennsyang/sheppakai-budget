import { render } from '@redwoodjs/testing/web';

import CategoryForm from './CategoryForm';

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('CategoryForm', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<CategoryForm />);
    }).not.toThrow();
  });
});
