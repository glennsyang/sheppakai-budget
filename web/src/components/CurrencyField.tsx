import React, { InputHTMLAttributes, useCallback } from "react";
import { useField, Field } from "formik";

type CurrencyFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const CurrencyField: React.FC<CurrencyFieldProps> = ({ label, size: _, ...props }) => {
  //console.log({ props });
  const [field, { error, touched }] = useField(props);
  //console.log({ field });
  // const handleChange = useCallback(() => {
  //   // DUMMY TO AVOID REACT WARNING
  //   console.log("dummy to avoid onChange");
  // }, []);
  // const valueDisplay = (field.value / 100).toLocaleString("en-US", {
  //   style: "currency",
  //   currency: "USD",
  // });

  return (
    <>
      <div className="block text-gray-400 font-bold mt-2">{label}</div>
      <Field
        {...field}
        {...props}
        id={field.name}
        name={field.name}
        //value={valueDisplay}
        //onChange={handleChange}
        inputMode="numeric"
        placeholder={`${label}...`}
        className="text-black text-right block rounded-md border border-gray-300 shadow-inner py-2 px-2 placeholder-gray-300"
      />
      {error && touched ? (<div className="text-red-400 text-md">{error}</div>) : null}
    </>
  );
};