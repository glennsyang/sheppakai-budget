import React, { useMemo } from "react";
import { Layout } from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import dayjs from "dayjs";
//import { withApollo } from "../utils/withApollo";
import { withApollo } from '../lib/withApollo'
import { CellValue } from "react-table";
import { FormValues } from "../components/Modal";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const Income: React.FC<{}> = ({ }) => {
  const income = useMemo(
    () => [
      { id: 1, date: "12-01-2020", amount: 789.90, description: "G Paycheck IBM", category: "Paycheck G - IBM" },
      { id: 2, date: "12-07-2020", amount: 718.15, description: "G Paycheck IBM", category: "Paycheck G - IBM" },
      { id: 3, date: "12-14-2020", amount: 816.65, description: "G Paycheck IBM", category: "Paycheck G - IBM" }
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
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

  };

  return (
    <Layout>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        <div id="content" className="w-5/6 p-4">

          <div>
            <Table
              columns={columns}
              data={income}
              tableName="Income"
              filterName="description"
              createData={createTransaction}
            />
          </div>

        </div>
      </main>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Income);
