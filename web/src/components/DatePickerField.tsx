import React from "react"
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerFieldProps {
  label: string;
  name: string;
}

//export const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, ...props }) => {
const DatePickerField = ({ label, ...props }: DatePickerFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [field, { error }] = useField(props);
  return (
    <>
      <div className="block text-gray-400 font-bold">{label}</div>
      <DatePicker
        {...field}
        {...props}
        dateFormat="dd/MM/yyyy"
        placeholderText="Click to select a date"
        selected={(field.value && new Date(field.value)) || null}
        onChange={val => {
          setFieldValue(field.name, val);
        }}
        className="text-black rounded-md border border-gray-400 shadow-inner py-2 px-2 placeholder-gray-400"
      />
      {error ? (<div className="text-red-400 text-md">{error}</div>) : null}
    </>
  );
};

export default DatePickerField;
