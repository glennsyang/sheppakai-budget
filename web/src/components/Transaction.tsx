import React from "react";

interface TransactionProps {
  date: string;
  amount: number;
  description: string;
  category: string;
}

const Transaction = ({ date, amount, description, category }: TransactionProps) => {
  return (
    <div className="flex-grow text-gray-500 text-sm font-medium">
      {date} - {amount} - {description} - {category}
    </div>
  );
};

export default Transaction;
