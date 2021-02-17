import React from "react";
import { FaCircleNotch } from "react-icons/fa";

const Loader = () => {
  return (
    <div className="flex-1 flex items-center text-5xl">
      <FaCircleNotch className="flex-1 icon-spin text-teal-500" />
    </div>
  );
};

export default Loader;
