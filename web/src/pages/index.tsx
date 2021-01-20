import React from "react";
import { Layout } from "../components/Layout";
import { withApollo } from "../utils/withApollo";
import Sidebar from "../components/Sidebar";
import SummaryBox from "../components/SummaryBox";

const data = [
  { id: 1, title: "Expenses", plannedTotal: 1290.22, actualTotal: 1321.45 },
  { id: 2, title: "Income", plannedTotal: 1290.22, actualTotal: 1321.45 },
];

const Index = () => {
  return (
    <Layout>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        <div id="content" className="w-5/6 p-4">

          <h1 className="text-orange-500 font-bold text-3xl">
            Summary
          </h1>
          <div className="flex flex-row justify-between py-4">
            {data.map((item) => (
              <SummaryBox key={item.id} title={item.title} plannedTotal={item.plannedTotal} actualTotal={item.actualTotal} />
            ))}
          </div>
          <div className="flex flex-row justify-between py-4">

          </div>

        </div>
      </main>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
