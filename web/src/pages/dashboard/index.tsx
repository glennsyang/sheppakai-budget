import React from "react";
import { withApollo } from "../../lib/withApollo";
import { useFetchUser } from "../../lib/user";

import Login from "../../components/auth/Login";
import Sidebar from "../../components/Sidebar";
import SummaryBox from "../../components/SummaryBox";
import Loader from "../../components/Loader";
import Dashboard from "../../components/Dashboard";

const data = [
  { id: 1, title: "Expenses", plannedTotal: 1290.22, actualTotal: 1321.45 },
  { id: 2, title: "Income", plannedTotal: 1290.22, actualTotal: 1321.45 },
];

const Index = () => {
  const { user, loading } = useFetchUser();
  if (!loading && !user) {
    return <Login />
  }

  return (
    <Dashboard>
      <main className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        {loading ? <Loader /> :
          <div id="content" className="w-5/6 p-4">

            <h1 className="text-orange-500 font-bold text-3xl">
              Summary
            </h1>
            <div className="flex flex-row justify-between py-4">
              {data.map((item) => (
                <SummaryBox key={item.id} title={item.title} plannedTotal={item.plannedTotal} actualTotal={item.actualTotal} />
              ))}
            </div>

          </div>
        }
      </main>
    </Dashboard>
  );
};

export default withApollo({ ssr: true })(Index);
//export default withApollo({ ssr: true })(Index);
//export default Index;
