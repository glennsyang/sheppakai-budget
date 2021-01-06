import React, { ReactNode } from 'react'
import { NavBar } from './NavBar';
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="leading-normal tracking-normal antialiased">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}