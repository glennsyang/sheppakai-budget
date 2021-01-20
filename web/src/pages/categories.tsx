import React, { useMemo } from "react";
import { Layout } from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import { withApollo } from "../utils/withApollo";

const Income: React.FC<{}> = ({ }) => {
  const categories = useMemo(
    () => [
      { id: 1, name: "Person", },
      { id: 2, name: "Entertainment", },
      { id: 3, name: "Other", }
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
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
              data={categories}
              tableName="Categories"
              filterName="name"
            />
          </div>

        </div>
      </main>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Income);
