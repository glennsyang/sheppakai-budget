import React from "react";
import Link from "next/link";
import { Layout } from "../components/Layout";

const Login: React.FC<{}> = ({ }) => {
  return (
    <Layout>
      <main className="container mx-auto bg-white">
        Login goes here...
      <Link href="/dashboard"><a>
          <button className="bg-transparent rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2">
            Dashboard
        </button>
        </a></Link>
      </main>

    </Layout>
  );
};

export default Login;
