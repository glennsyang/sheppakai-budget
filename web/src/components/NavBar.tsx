import React from "react";
import Link from "next/link";
import Router from "next/router";
import { useFetchUser } from "../lib/user";

const NavBar = ({ }) => {
  const { user } = useFetchUser();

  const menuItems = (
    <div>
      {!user ?
        <div className="py-2">
          <Link href="/signup"><a>
            <button className="hover:underline text-gray-800 font-bold focus:outline-none focus:shadow-outline mx-6">
              Sign Up
            </button>
          </a></Link>
          <button
            className="bg-transparent rounded-xl bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:shadow-outline font-bold px-4 py-2"
            onClick={() => {
              Router.push('/api/login');
            }}
          >
            Login
          </button>
        </div>
        :
        <div className="flex justify-between items-center">
          <Link href="/dashboard"><a>
            <div className="flex flex-row items-center bg-gray-200 border-l border-r py-2 px-4 mr-4">
              <img src={user.picture} alt={user.nickname} className="h-12 w-12 object-cover rounded-full" />
              <div className="ml-2">
                <span className="block text-sm font-semibold text-gray-600 capitalize antialiased">{user ? user.nickname : 'Admin'}</span>
                <span className="block text-xs text-gray-600 antialiased">{user ? user.name : 'Admin'}</span>
              </div>
            </div>
          </a></Link>
          <button
            className="bg-transparent rounded-xl bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:shadow-outline font-bold px-4 py-2"
            onClick={() => {
              Router.push("/api/logout");
            }}
          >
            Logout
          </button>
        </div>
      }
    </div>
  );

  return (
    <div className="sticky border-b shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-teal-500">
          <Link href="/">SHEPPAKAI BUDGET</Link>
        </h1>
        {menuItems}
      </div>
    </div>
  );
};

export default NavBar;
