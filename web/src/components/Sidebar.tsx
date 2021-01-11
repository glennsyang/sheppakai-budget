import React, { useState } from "react";
import NextLink from "next/link";
import { FaGlobe, FaReceipt, FaDollarSign, FaList, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface MenuItemProps {
  name: string;
  linkTo: string;
  icon: string;
  fold: boolean;
}

const MenuItem = ({ name, linkTo, icon, fold }: MenuItemProps) => {
  let iconDisplay;
  if (icon === "FaGlobe") { iconDisplay = <FaGlobe size={16} className="mr-2" /> };
  if (icon === "FaReceipt") { iconDisplay = <FaReceipt size={16} className="mr-2" /> };
  if (icon === "FaDollarSign") { iconDisplay = <FaDollarSign size={16} className="mr-2" /> };
  if (icon === "FaList") { iconDisplay = <FaList size={16} className="mr-2" /> };

  return (
    <div className={`text-base hover:text-white ${fold ? 'ml-2 px-4 py-2 mt-4' : 'px-6 py-2 mx-6 mt-4'}`}>
      <NextLink href={linkTo}>
        <a title={name} className="flex flex-row justify-between items-center font-semibold">
          {fold
            ? <span className="flex items-center">{iconDisplay}</span>
            : <span className="flex items-center">{iconDisplay}{name}</span>
          }
        </a>
      </NextLink>
    </div>
  );
};

const Sidebar = () => {
  const [showSidebar, setShowSidebar] = useState(false)
  const toggleSidebar = () => { setShowSidebar(!showSidebar) }

  const classShow = "md:w-16 lg:w-16";
  const classHide = "md:w-min lg:w-min";
  const menuItems = [
    { name: "Summary", linkTo: "/", icon: "FaGlobe" },
    { name: "Expenses", linkTo: "/expenses", icon: "FaReceipt" },
    { name: "Income", linkTo: "/income", icon: "FaDollarSign" },
    { name: "Categories", linkTo: "/categories", icon: "FaList" },
  ];

  return (
    <aside id="sidebar" className={`bg-teal-500 text-white ${showSidebar ? classShow : classHide} hidden md:block lg:block`}>
      <div className="flex flex-col">
        <div className="flex justify-between items-center p-6">
          {showSidebar ? '' : <NextLink href={`/`}><span className="text-lg font-bold antialiased">Dashboard</span></NextLink>}
          <button type="button" className="outline-none focus:outline-none" onClick={toggleSidebar}>
            {showSidebar ? <FaAngleDoubleRight size={16} /> : <FaAngleDoubleLeft size={16} />}
          </button>
        </div>
        {menuItems.map((item, id) => {
          return (
            <MenuItem key={id} name={item.name} linkTo={item.linkTo} icon={item.icon} fold={showSidebar} />
          )
        })}
      </div>
    </aside >
  );
};

export default Sidebar;
