import React from "react";
import Router from "next/router";
import Layout from "../Layout";

const Login = ({ }) => {
  return (
    <Layout>
      <main className="container mx-auto bg-white">
        Please login using your credentials
        <div>
          <button
            id="qsLoginBtn"
            className="bg-transparent rounded-xl bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:shadow-outline font-bold px-4 py-2"
            onClick={() => {
              Router.push('/api/login');
            }}
          >
            Log In
          </button>
        </div>
      </main>
    </Layout>
  );
};

export default Login;
