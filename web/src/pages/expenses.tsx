import React, { useMemo } from "react";
import { Layout } from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import dayjs from "dayjs";
import { withApollo } from "../utils/withApollo";
import { CellValue } from "react-table";
import AddButton from "../components/AddButton";

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const Expenses: React.FC<{}> = ({ }) => {
  const expenses = useMemo(
    () => [
      { id: 1, date: "12-01-2020", amount: 22.64, description: "toothbrushes", category: "Personal" },
      { id: 2, date: "12-07-2020", amount: 8.30, description: "watercolor set, brush pens, sketch book", category: "Other" },
      { id: 3, date: "12-08-2020", amount: 29.99, description: "whiskey", category: "Entertainment" }
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ cell: { value } }: CellValue) => dayjs(value).format("DD-MMM-YYYY"),
        sortType: 'datetime'
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ cell: { value } }: CellValue) => <div className="font-bold">{formatter.format(value)}</div>,
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
    ],
    []
  );

  return (
    <Layout>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        <div id="content" className="w-5/6 p-4">

          <div>
            <Table
              columns={columns}
              data={expenses}
              tableName="Expenses"
              filterName="description"
            />
          </div>

        </div>
      </main>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Expenses);
