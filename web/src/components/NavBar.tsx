import React from "react";
import Link from "next/link";
// import { useLogoutMutation, useMeQuery } from "../generated/graphql";
// import { isServer } from "../utils/isServer";
// import { useRouter } from "next/router";
// import { useApolloClient } from "@apollo/client";

const NavBar = ({ }) => {
  // const router = useRouter();
  // const [logout, { loading: logoutFetching }] = useLogoutMutation();
  // const apolloClient = useApolloClient();
  // const { data, loading } = useMeQuery({
  //   skip: isServer(),
  // });
  // let menuItems = null;

  const menuItems = (
    <div>
      <Link href="/signup"><a>
        <button className="hover:underline text-gray-800 font-bold focus:outline-none focus:shadow-outline mx-6">
          Sign Up
        </button>
      </a></Link>
      <Link href="/dashboard"><a>
        <button className="bg-transparent rounded-xl bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:shadow-outline font-bold px-4 py-2">
          Login
        </button>
      </a></Link>
    </div>
  );

  return (
    <div className="sticky border-b shadow-md">
      <div className="container mx-auto flex justify-between items-center py-2">
        <h1 className="text-xl font-bold text-teal-500">
          <Link href="/">SHEPPAKAI BUDGET</Link>
        </h1>
        {menuItems}
      </div>
    </div>
  );
};

export default NavBar;
