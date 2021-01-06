import React from "react";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { UpdootSection } from "../components/UpdootSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  return (
    <Layout>
      <main className="container mx-auto py-4">
        <h1 className="text-orange-500 font-bold text-3xl">
          Budget
        </h1>
        <div className="flex flex-row justify-between py-4">

          <div className="flex-grow border rounded-lg mx-4 p-2">
            <p className="text-teal-500 text-2xl font-semibold">Expenses</p>
            <div className="flex justify-between mt-2">
              <p className="text-gray-500 text-base font-semibold">Planned</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500 text-base font-semibold">Actual</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
          </div>

          <div className="flex-grow border rounded-lg mx-4 p-2">
            <p className="text-teal-500 text-2xl font-semibold">Income</p>
            <div className="flex justify-between mt-2">
              <p className="text-gray-500 text-base font-semibold">Planned</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500 text-base font-semibold">Actual</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
          </div>

        </div>

        <div className="flex flex-row justify-between py-4">
          <div className="flex-grow border rounded-lg mx-4 p-2">
            <p className="text-orange-500 text-2xl font-semibold">Expenses</p>
            <div className="flex justify-between mt-2">
              <p className="text-gray-500 text-base font-semibold">Category</p>
              <p className="text-gray-500 text-base font-medium">Planned</p>
              <p className="text-gray-500 text-base font-medium">Actual</p>
              <p className="text-gray-500 text-base font-medium">Diff.  </p>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-500 text-base font-semibold">Groceries</p>
              <p className="text-gray-500 text-base font-medium">$400.00</p>
              <p className="text-gray-500 text-base font-medium">$432.20</p>
              <p className="text-gray-500 text-base font-medium">$32.20</p>
            </div>
            <div className="flex justify-between">
            </div>
          </div>

          <div className="flex-grow border rounded-lg mx-4 p-2">
            <p className="text-orange-500 text-2xl font-semibold">Income</p>
            <div className="flex justify-between mt-2">
              <p className="text-gray-500 text-base font-semibold">Planned</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500 text-base font-semibold">Actual</p>
              <p className="text-gray-500 text-base font-medium">$1,290.20</p>
            </div>
          </div>
        </div>

      </main>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
