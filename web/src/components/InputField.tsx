import React, { InputHTMLAttributes } from "react";
import { useField, Field } from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const InputField: React.FC<InputFieldProps> = ({ label, size: _, ...props }) => {
  const [field, { error, touched }] = useField(props);
  return (
    <>
      <div className="block text-gray-400 font-bold mt-2">{label}</div>
      <Field
        {...field}
        {...props}
        id={field.name}
        name={field.name}
        placeholder={`${label}...`}
        className="text-black w-full block rounded-md border border-gray-300 shadow-inner py-2 px-2 placeholder-gray-300"
      />
      {error && touched ? (<div className="text-red-400 text-md">{error}</div>) : null}
    </>
  );
};