import { Empty, Failure, Loading, Success } from './ExpenseCell';
import { standard } from './ExpenseCell.mock';

export const loading = (args) => {
  return Loading ? <Loading {...args} /> : null;
};

export const empty = (args) => {
  return Empty ? <Empty {...args} /> : null;
};

export const failure = () => {
  return Failure ? <Failure error={new Error('Oh no')} /> : null;
};

export const success = () => {
  return Success ? <Success expense={standard().expense} /> : null;
};

export default { title: 'Cells/ExpenseCell' };
