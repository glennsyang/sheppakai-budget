import React, { useMemo } from "react";
import { CellValue } from "react-table";
import gql from "graphql-tag";
import dayjs from "dayjs";

import Layout from "../../components/Layout";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { FormValues } from "../../components/Modal";
import { withApollo } from '../../lib/withApollo'
import { useQuery, useMutation } from "@apollo/react-hooks";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const GET_MY_TRANSACTIONS = gql`
  query getMyTransactions {
    transactions {
      id
      amount
      description
      transactionDate
  }
}`;

const ADD_TRANSACTION = gql`
  mutation ($amount: numeric!, $description: String!, $categoryId: uuid, $transDate: timestamptz, $userId: String!) {
    insert_transactions(objects: {
      amount: $amount, 
      description: $description,
      categoryId: $categoryId,
      transactionDate: $transDate,
      userId: $userId,
    }) {
      affected_rows
      returning {
        id
        description
        createdAt
        amount
      }
    }
  }
`;

const Expenses: React.FC<{}> = ({ }) => {
  const { loading, error, data } = useQuery(GET_MY_TRANSACTIONS);
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  // const expenses = useMemo(
  //   () => [
  //     { id: 1, transactionDate: "12-01-2020", amount: 22.64, description: "toothbrushes", category: "Personal" },
  //     { id: 2, transactionDate: "12-07-2020", amount: 8.30, description: "watercolor set, brush pens, sketch book", category: "Other" },
  //     { id: 3, transactionDate: "12-08-2020", amount: 29.99, description: "whiskey", category: "Entertainment" }
  //   ],
  //   []
  // );

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "transactionDate",
        Cell: ({ cell: { value } }: CellValue) => dayjs(value).format("DD-MMM-YYYY"),
        sortType: "datetime"
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ cell: { value } }: CellValue) => <div className="font-bold">{formatter.format(value)}</div>,
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Category",
        accessor: "category",
      },
    ],
    []
  );
  const createTransaction = (modalData: FormValues) => {
    console.log(modalData);
    addTransaction({
      variables: {
        amount: modalData.amount,
        description: modalData.description,
        categoryId: "7f4456cc-7147-4e0d-9d2b-80bae3c2030e",
        transactionDate: modalData.transdate,
        userId: "auth0|0123456789",
      }
    });
  };

  if (error) {
    console.log({ error });
    return <div>Error!</div>;
  }
  return (
    <Layout>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        {loading ? <div>Loading...</div> :
          <div id="content" className="w-5/6 p-4">

            <div>
              <Table
                columns={columns}
                data={data.transactions}
                tableName="Expenses"
                filterName="description"
                createData={createTransaction}
              />
            </div>

          </div>
        }
      </main>
    </Layout>
  );
};

export default withApollo()(Expenses);
