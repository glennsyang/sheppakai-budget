import React, { CSSProperties, InputHTMLAttributes, KeyboardEvent, useCallback } from "react";
import { Field, useField } from "formik";

// type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
//   name: string;
// };

type CurrencyFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  max?: number;
  onValueChange: (value: number) => void;
  style?: CSSProperties;
  value: number;
  label: string;
  name: string;
}

// interface CurrencyFieldProps {
//   className?: string;
//   max?: number;
//   onValueChange: (value: number) => void;
//   style?: CSSProperties;
//   value: number;
//   label: string;
// }

const VALID_FIRST = /^[1-9]{1}$/;
const VALID_NEXT = /^[0-9]{1}$/;
const DELETE_KEY_CODE = 8;

const CurrencyField2: React.FC<CurrencyFieldProps> = ({
  className = "",
  max = Number.MAX_SAFE_INTEGER,
  onValueChange,
  style = {},
  value,
  label,
  size: _,
  ...props
}) => {
  const valueAbsTrunc = Math.trunc(Math.abs(value));
  if (value !== valueAbsTrunc || !Number.isFinite(value) || Number.isNaN(value)) {
    throw new Error(`invalid value property`);
  }
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>): void => {
      const { key, keyCode } = e;
      if (
        (value === 0 && !VALID_FIRST.test(key)) ||
        (value !== 0 && !VALID_NEXT.test(key) && keyCode !== DELETE_KEY_CODE)
      ) {
        return;
      }
      const valueString = value.toString();
      let nextValue: number;
      if (keyCode !== DELETE_KEY_CODE) {
        const nextValueString: string = value === 0 ? key : `${valueString}${key}`;
        nextValue = Number.parseInt(nextValueString, 10);
      } else {
        const nextValueString = valueString.slice(0, -1);
        nextValue = nextValueString === "" ? 0 : Number.parseInt(nextValueString, 10);
      }
      if (nextValue > max) {
        return;
      }
      console.log(field, value, nextValue);
      onValueChange(nextValue);
    },
    [max, onValueChange, value]
  );
  const handleChange = useCallback(() => {
    // DUMMY TO AVOID REACT WARNING
  }, []);
  const valueDisplay = (value / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const [field, { error, touched }] = useField(props);

  return (
    <>
      <div className="block text-gray-400 font-bold mt-2">{label}</div>
      <Field
        {...field}
        {...props}
        id={field.name}
        name={field.name}
        className={className}
        inputMode="numeric"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={style}
        value={valueDisplay}
        placeholder={`${label}`}
      />
      {error && touched ? (<div className="text-red-400 text-md">{error}</div>) : null}
    </>
  );
};

export default CurrencyField2;
