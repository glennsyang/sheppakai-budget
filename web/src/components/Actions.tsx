import React from "react";
import { Row } from "react-table";
import { FaPen, FaTimesCircle } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useDeleteTransactionMutation } from "../generated/graphql";

interface ActionsProps {
  rowProps: any;
  collection: string;
}

const Actions = ({ rowProps, collection }: ActionsProps) => {
  const [deleteTransaction] = useDeleteTransactionMutation();
  //const onCloseToast = (toastProps) => { onCloseToast && onCloseToast(toastProps) };

  const handleDelete = (row: Row) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="border border-gray-300 text-gray-600 antialiased shadow-lg rounded-lg p-10">
            <h1 className="text-xl font-bold">Delete!</h1>
            <p className="text-lg mt-4 mb-8">Are you sure you want to delete this {collection}?</p>
            <button
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-2"
              onClick={async () => {
                const { errors, data } = await deleteTransaction({
                  variables: {
                    transId: row.id,
                  }
                });
                if (errors) { console.log({ errors }); }
                else {
                  if (data?.delete_transactions?.affected_rows != 0) {
                    console.log("Success!");
                  } else {
                    // display error on screen
                    alert("No rows were deleted. You may not have permissions to delete this row.")
                    console.log("No rows were updated. Check your permissions!");
                  }
                }
                onClose();
              }}
            >
              Yes
            </button>
            <button onClick={onClose} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">No</button>
          </div>
        );
      }
    });
  };

  return (
    <>
      <button type="button" aria-label="Delete" onClick={() => handleDelete(rowProps)} className="text-red-500"><FaTimesCircle size={16} />
      </button>
    </>
  );
};

export default Actions;
