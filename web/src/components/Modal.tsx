import React from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import DatePickerField from "./fields/DatePickerField";
import InputField from "./fields/InputField";
import SelectField from "./fields/SelectField";
import CurrencyField from "./fields/CurrencyField";
import { TransactionFormValues } from "../types";
import { useGetCategoriesQuery } from "../generated/graphql";

const transactionSchema = Yup.object().shape({
  transdate: Yup.date()
    .required("*Required").nullable(),
  description: Yup.string()
    .min(4, '*Must be at least 4 characters')
    .required("*Required"),
  category: Yup.string()
    .required("*Required"),
  amount: Yup.number()
    .required("*Required")
    .positive(),
});

interface ModalProps {
  show: boolean;
  tableName: string;
  onClose: () => void;
  onCreate(modalData: TransactionFormValues): void;
};

const Modal = ({ show, tableName, onClose, onCreate }: ModalProps) => {
  // Close button
  const handleClose = () => { onClose && onClose() }
  // Submit button
  const onSubmit = (modalData: TransactionFormValues) => { onCreate({ ...modalData }) }
  const initialValues: TransactionFormValues = { transdate: "", amount: 0, description: "", category: "", };
  // Get Categories
  const { data, error, loading } = useGetCategoriesQuery({
    notifyOnNetworkStatusChange: true,
  });
  const options = data?.categories.map((category) => (
    { value: category.id, label: category.name }
  ));

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
                values: TransactionFormValues,
                { setSubmitting }: FormikHelpers<TransactionFormValues>
              ) => {
                //console.log({ values });
                onSubmit(values);
                setSubmitting(false);
              }}>
              {({ isSubmitting }) => (
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
                    <SelectField
                      label="Category"
                      name="category"
                      options={options}
                      iid="category"
                    />

                    <CurrencyField
                      label="Amount"
                      name="amount"
                    />

                    {/* Buttons */}
                    <div className="flex items-center justify-end py-2 px-4 mt-4 border-t border-solid border-gray-300 rounded-b">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="bg-transparent rounded-xl text-teal-500 border border-teal-500 hover:text-teal-600 hover:border-teal-600 font-bold px-4 py-2 mr-2"
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
