import React from "react";
import { FIELD_REQUIRED } from "../utils/constants";

const Transaction = () => {
  return (
    <div className="relative px-4 pb-4 flex-1">
      <div className="block text-gray-400 font-bold">Date</div>
      <input
        type="text"
        name="transDate"
        placeholder="Date"
        aria-label="Date"
        ref={register({ required: { value: true, message: FIELD_REQUIRED } })}
        className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
      />
      {errors.transactionDate && <span className="text-red-400 text-md">{errors?.transactionDate?.message}</span>}

      <div className="block text-gray-400 font-bold mt-2">Description</div>
      <input
        type="text"
        name="description"
        placeholder="Description"
        aria-label="Description"
        ref={register({ required: true, maxLength: 20 })}
        className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
      />
      {errors.description && <span className="text-red-400 text-md">{errors?.description?.message}</span>}

      <div className="block text-gray-400 font-bold mt-2">Amount</div>
      <input
        type="text"
        name="amount"
        placeholder="Amount"
        aria-label="Amount"
        ref={register({ required: { value: true, message: FIELD_REQUIRED } })}
        className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
      />
      {errors.amount && <span className="text-red-400 text-md">{errors?.amount?.message}</span>}

      <div className="block text-gray-400 font-bold mt-2">Category</div>
      <input
        type="text"
        name="category"
        placeholder="Category"
        aria-label="Category"
        ref={register({ required: { value: true, message: FIELD_REQUIRED } })}
        className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
      />
      {errors.category && <span className="text-red-400 text-md">{errors?.category?.message}</span>}
    </div>
  );
};

export default Transaction;
