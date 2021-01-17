import React from "react";
import { Formik, Field, Form, FormikHelpers } from "formik";

interface ModalProps {
  show: boolean;
  tableName: string;
  onClose: () => void;
  onCreate(modalData: FormValues): void;
}

export interface FormValues {
  transdate: string;
  amount: string;
  description: string;
  category: string;
}

const Modal = ({ show, tableName, onClose, onCreate }: ModalProps) => {
  // Close button
  const handleClose = () => { onClose && onClose() }
  // Submit button
  const onSubmit = (modalData: FormValues) => { onCreate({ ...modalData }) }
  const initialValues: FormValues = { transdate: "", amount: "", description: "", category: "", };

  if (!show) { return null }
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative my-6 mx-1 lg:mx-auto w-2/3 max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <h1 className="text-xl font-bold text-teal-500 pt-2 px-4 pb-4">
              {tableName.toUpperCase()}
            </h1>
            <Formik
              initialValues={initialValues}
              onSubmit={(
                values: FormValues,
                { setSubmitting }: FormikHelpers<FormValues>
              ) => {
                //console.log({ values });
                onSubmit(values);
                setSubmitting(false);
              }}>
              {({ isSubmitting }) => (
                <Form>
                  <div className="flex-1 px-4 pb-4 mr-2">
                    <div className="block text-gray-400 font-bold">Date</div>
                    <Field
                      id="transdate"
                      name="transdate"
                      placeholder="Transaction Date"
                      className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
                    />
                    <div className="block text-gray-400 font-bold mt-2">Description</div>
                    <Field
                      id="description"
                      name="description"
                      placeholder="Description"
                      className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
                    />
                    <div className="block text-gray-400 font-bold mt-2">Amount</div>
                    <Field
                      id="amount"
                      name="amount"
                      placeholder="Amount"
                      className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
                    />
                    <div className="block text-gray-400 font-bold mt-2">Category</div>
                    <Field
                      id="category"
                      name="category"
                      placeholder="Category"
                      className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
                    />
                    {/* Buttons */}
                    <div className="flex items-center justify-end py-2 px-4 mt-4 border-t border-solid border-gray-300 rounded-b">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="bg-transparent rounded-xl text-teal-500 border border-teal-500 hover:bg-teal-500 hover:text-white font-bold px-4 py-2 mr-2"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        value="Submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-teal-500 border border-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default Modal;
