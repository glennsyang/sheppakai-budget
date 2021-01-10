import React from 'react';
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';

export const NavBar = ({ }) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let menuItems = null;

  if (loading) {
    // user not logged in
  } else if (!data?.me) {
    menuItems = (
      <div>
        <NextLink href="/login">
          <button className="bg-transparent rounded-xl bg-teal-500 text-white font-bold px-4 py-2">
            Login
          </button>
        </NextLink>
      </div>
    );
  } else {
    menuItems = (
      <div>
        <NextLink href="/create-post">
          <button className="rounded-xl bg-teal-500 text-white font-bold px-4 py-2">
            Create Entry
          </button>
        </NextLink>
        <div>{data.me.username.toUpperCase()}</div>
        <button className="rounded-xl bg-teal-500 text-white font-bold px-4 py-2">
          Logout
        </button>
      </div>
    );
  }

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