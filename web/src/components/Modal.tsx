import React from "react";
import { useForm } from "react-hook-form";
import Transaction from "./Transaction";

interface ModalProps {
  show: boolean;
  tableName: string;
  onClose: () => void;
  onCreate(modalData: FormValues): void;
}

export type FormValues = {
  transDate: string;
  amount: string;
  description: string;
  category: string;
};

const Modal = ({ show, tableName, onClose, onCreate }: ModalProps) => {
  const { register, errors, handleSubmit } = useForm<FormValues>();
  // Close button
  const handleClose = () => { onClose && onClose() }
  // Submit button
  const onSubmit = (modalData: FormValues) => { onCreate({ ...modalData }) }

  if (!show) { return null }
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative my-6 mx-1 lg:mx-auto w-2/3 max-w-3xl">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/*header*/}
              <h1 className="text-xl font-bold text-teal-500 pt-2 px-4 pb-4">
                {tableName.toUpperCase()}
              </h1>
              {/*form*/}
              <Transaction register={register} errors={errors} />
              {/*footer*/}
              <div className="flex items-center justify-end py-2 px-4 mt-4 border-t border-solid border-gray-300 rounded-b">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-transparent rounded-xl text-teal-500 border border-teal-500 hover:bg-teal-500 hover:text-white font-bold px-4 py-2 mr-2">
                  Close
                </button>
                <button
                  type="submit"
                  value="Submit"
                  className="rounded-xl bg-teal-500 border border-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default Modal;
