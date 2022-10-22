import { render } from '@redwoodjs/testing/web'

import Expense from './Expense'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('Expense', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<Expense />)
    }).not.toThrow()
  })
})
