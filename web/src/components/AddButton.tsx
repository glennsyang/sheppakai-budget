import React from "react";
import { FaPlusCircle } from "react-icons/fa";

interface AddButtonProps {
  title: string;
}

const AddButton = ({ title }: AddButtonProps) => {
  return (
    <button className="text-orange-500" title={`Add New ${title}`}>
      <FaPlusCircle size={20} />
    </button>
  );
};

export default AddButton;
