import React, { useEffect, useMemo, useState } from "react";
import { Cell, CellValue } from "react-table";
import dayjs from "dayjs";

import { TYPE_ID_EXPENSE } from "../../utils/constants";
import Layout from "../../components/Layout";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { withApollo } from '../../lib/withApollo'
import { useGetTransactionsQuery, useCreateTransactionMutation, useUpdateTransactionMutation, GetTransactionsQuery, Transactions } from '../../generated/graphql';
import { useFetchUser } from "../../lib/user";
import Actions from "../../components/Actions";
import EditableCell from "../../components/EditableCell";
import Loader from "../../components/Loader";
import { TransactionFormValues } from "../../types";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const Expenses: React.FC<{}> = ({ }) => {
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  const { data, error, loading, refetch } = useGetTransactionsQuery({
    variables: { type: "expense", },
    notifyOnNetworkStatusChange: true,
  });
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const { user } = useFetchUser();

  useEffect(() => {
    if (shouldUpdate) {
      refetch();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, setShouldUpdate, refetch]);

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
        Cell: EditableCell,
      },
      {
        Header: "Category",
        accessor: "category.name",
      },
      {
        Header: "Entered By",
        accessor: "user.name",
      },
      {
        Header: "Actions",
        disableSortBy: true,
        id: 'actions',
        accessor: 'actions',
        Cell: ({ row }: Cell) => (<Actions rowProps={row.original} collection={'expense'} />)
      },
    ],
    []
  );
  const updateData = async (rowIndex: number, columnId: string, value: CellValue) => {
    setSkipPageReset(true);
    const old = data!.transactions[rowIndex]
    if (value != old.description) {
      const { errors, data } = await updateTransaction({
        variables: {
          transId: old.id,
          amount: old.amount,
          description: value,
          transDate: old.transactionDate
        },
        // update: (cache) => {
        //   cache.evict({ fieldName: "transactions:{}" });
        // },
      });
      if (errors) { console.log({ errors }); }
      else {
        if (data?.update_transactions?.affected_rows != 0) {
          console.log("Success!");
        } else {
          // display error on screen
          alert("No rows were updated. You may not have permissions to update this row.")
          console.log("No rows were updated. Check your permissions!");
          console.log({ user });
        }
      }
      setShouldUpdate(true);
    }
  };
  const handleCreateTransaction = async (modalData: TransactionFormValues) => {
    console.log(modalData);
    const { errors } = await createTransaction({
      variables: {
        amount: modalData.amount,
        description: modalData.description,
        categoryId: modalData.category,
        transDate: dayjs(modalData.transdate).format("YYYY-MM-DDTHH:mm:ssZ"),
        userId: user.sub,
        typeId: TYPE_ID_EXPENSE,
      },
      // update: (cache) => {
      //   cache.evict({ fieldName: "transactions:{}" });
      // },
    });
    if (errors) {
      console.log({ errors });
    } else {
      setShouldUpdate(true);
    }
  };

  if (error) {
    console.log({ error });
    return <div>Error!<div>{error.message}</div></div>;
  }
  return (
    <Layout>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        {loading ? <Loader /> :
          <div id="content" className="w-5/6 p-4">
            <div>
              <Table
                columns={columns}
                data={data?.transactions}
                tableName="Expenses"
                filterName="description"
                createData={handleCreateTransaction}
                updateData={updateData}
                skipPageReset={skipPageReset}
              />
            </div>
          </div>
        }
      </main>
    </Layout>
  );
};

export default withApollo()(Expenses);
