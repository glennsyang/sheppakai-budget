import React, { ReactNode } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";

interface DashboardProps {
  children: ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return (
    <div className="leading-normal tracking-normal antialiased">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default Dashboard;
