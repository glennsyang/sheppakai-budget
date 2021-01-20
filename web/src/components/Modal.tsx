import React, { useCallback, useState } from "react";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import Select from "react-select";

import { customStyles } from "../utils/constants";
import DatePickerField from "./DatePickerField";
import { InputField } from "./InputField";
import CurrencyField from "./CurrencyField";

const transactionSchema = Yup.object().shape({
  transdate: Yup.date()
    .required("*Required").nullable(),
  description: Yup.string()
    .required("*Required"),
  amount: Yup.string()
    .required("*Required"),
  category: Yup.string()
    .required("*Required"),
});

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

const categories = [
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' }
];

const Modal = ({ show, tableName, onClose, onCreate }: ModalProps) => {
  // Close button
  const handleClose = () => { onClose && onClose() }
  // Submit button
  const onSubmit = (modalData: FormValues) => { onCreate({ ...modalData }) }
  const initialValues: FormValues = { transdate: "", amount: "", description: "", category: "", };

  const [value, setValue] = useState(0);
  const handleValueChange = useCallback(val => {
    // eslint-disable-next-line
    console.log(val);
    setValue(val);
  }, []);

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
              validationSchema={transactionSchema}
              onSubmit={(
                values: FormValues,
                { setSubmitting }: FormikHelpers<FormValues>
              ) => {
                //console.log({ values });
                onSubmit(values);
                setSubmitting(false);
              }}>
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <div className="flex-1 px-4 pb-4 mr-2">

                    <DatePickerField
                      label="Transaction Date"
                      name="transdate"
                    />

                    <InputField
                      label="Description"
                      name="description"
                    />

                    <div className="block text-gray-400 font-bold mt-2">Category</div>
                    <Select
                      name="category"
                      placeholder="Select Category..."
                      styles={customStyles}
                      //className="basic-single"
                      //classNamePrefix="select"
                      isClearable
                      isSearchable
                      options={categories}
                    />

                    <div className="block text-gray-400 font-bold mt-2">Amount</div>
                    <CurrencyField
                      max={100000000}
                      onValueChange={handleValueChange}
                      style={{ textAlign: 'right' }}
                      value={value}
                      //id="amount"
                      //name="amount"
                      ///placeholder="Amount"
                      className="text-black w-full block rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
                    />
                    {errors.amount && touched.amount ? (<div className="text-red-400 text-md">{errors.amount}</div>) : null}

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
