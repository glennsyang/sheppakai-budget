import React from "react";

interface SummaryBoxProps {
  title: string;
  plannedTotal: number;
  actualTotal: number;
}

const SummaryBox = ({ title, plannedTotal, actualTotal }: SummaryBoxProps) => {
  return (
    <div className="flex-grow border rounded-lg mx-4 p-2">
      <p className="text-teal-500 text-2xl font-semibold">{title}</p>
      <div className="flex justify-between mt-2">
        <p className="text-gray-500 text-base font-semibold">Planned</p>
        <p className="text-gray-500 text-base font-medium">${plannedTotal}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-gray-500 text-base font-semibold">Actual</p>
        <p className="text-gray-500 text-base font-medium">$1{actualTotal}</p>
      </div>
    </div>
  );
};

export default SummaryBox;
