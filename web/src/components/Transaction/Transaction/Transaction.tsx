import humanize from 'humanize-string';

import { Link, navigate, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';

const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransactionMutation($id: Int!) {
    deleteTransaction(id: $id) {
      id
    }
  }
`;

const formatEnum = (values: string | string[] | null | undefined) => {
  if (values) {
    if (Array.isArray(values)) {
      const humanizedValues = values.map((value) => humanize(value));
      return humanizedValues.join(', ');
    } else {
      return humanize(values as string);
    }
  }
};

const jsonDisplay = (obj) => {
  return (
    <pre>
      <code>{JSON.stringify(obj, null, 2)}</code>
    </pre>
  );
};

const timeTag = (datetime) => {
  return (
    datetime && (
      <time dateTime={datetime} title={datetime}>
        {new Date(datetime).toUTCString()}
      </time>
    )
  );
};

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />;
};

const Transaction = ({ transaction }) => {
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION_MUTATION, {
    onCompleted: () => {
      toast.success('Transaction deleted');
      navigate(routes.transactions());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete transaction ' + id + '?')) {
      deleteTransaction({ variables: { id } });
    }
  };

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Transaction {transaction.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{transaction.id}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{transaction.description}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td>{transaction.amount}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>{timeTag(transaction.date)}</td>
            </tr>
            <tr>
              <th>Type</th>
              <td>{transaction.type}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(transaction.createdAt)}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>{timeTag(transaction.updatedAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editTransaction({ id: transaction.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(transaction.id)}
        >
          Delete
        </button>
      </nav>
    </>
  );
};

export default Transaction;
