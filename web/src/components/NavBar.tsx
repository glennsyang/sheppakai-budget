import React from "react";
import Link from "next/link";
// import { useLogoutMutation, useMeQuery } from "../generated/graphql";
// import { isServer } from "../utils/isServer";
// import { useRouter } from "next/router";
// import { useApolloClient } from "@apollo/client";

export const NavBar = ({ }) => {
  // const router = useRouter();
  // const [logout, { loading: logoutFetching }] = useLogoutMutation();
  // const apolloClient = useApolloClient();
  // const { data, loading } = useMeQuery({
  //   skip: isServer(),
  // });
  // let menuItems = null;

  const menuItems = (
    <div>
      <Link href="/login">
        <button className="bg-transparent rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2">
          Login
          </button>
      </Link>
    </div>
  );

  return (
    <div className="sticky border-b shadow-md">
      <div className="container mx-auto flex justify-between items-center py-2">
        <h1 className="text-xl font-bold text-teal-500">
          SHEPPAKAI BUDGET
        </h1>
        {menuItems}
      </div>
    </div>
  );
}