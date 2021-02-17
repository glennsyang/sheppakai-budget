import React, { useMemo, useState } from "react";
import { Cell, CellValue } from "react-table";
import dayjs from "dayjs";

import Layout from "../../components/Layout";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table";
import { withApollo } from '../../lib/withApollo'
import { useFetchUser } from "../../lib/user";
import EditableCell from "../../components/EditableCell";
import Loader from "../../components/Loader";
import { useCreateCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation } from "../../generated/graphql";
import Actions from "../../components/Actions";
import { TransactionFormValues } from "../../types";

const Categories: React.FC<{}> = ({ }) => {
  const [skipPageReset, setSkipPageReset] = useState(false);
  const { data, error, loading } = useGetCategoriesQuery({
    notifyOnNetworkStatusChange: true,
  });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const { user } = useFetchUser();

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Cell: EditableCell,
      },
      {
        Header: "Updated",
        accessor: "updatedAt",
        Cell: ({ cell: { value } }: CellValue) => dayjs(value).format("DD-MMM-YYYY"),
        sortType: "datetime"
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
    console.log(rowIndex, columnId, value);
    const id = data!.categories[rowIndex].id;
    const old = data!.categories[rowIndex]
    if (value != old.name) {
      await updateCategory({
        variables: {
          id: id,
          name: value,
        }
      });
    }
  };
  const handleCreateCategory = async (modalData: TransactionFormValues) => {
    console.log(modalData);
    // const { errors } = await createCategory({
    //   variables: {
    //     name: modalData.name,
    //   },
    //   // update: (cache) => {
    //   //   cache.evict({ fieldName: "transactions:{}" });
    //   // },
    // });
    // if (errors) {
    //   console.log({ errors });
    // }
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
                data={data!.categories}
                tableName="Categories"
                filterName="name"
                createData={handleCreateCategory}
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

export default withApollo()(Categories);
