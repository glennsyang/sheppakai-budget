import React, { useState, useEffect } from "react";
import { CellValue, ColumnInstance, Row } from "react-table";

interface EditableCellProps {
  value: CellValue;
  row: Row;
  column: ColumnInstance;
  updateData(rowIndex: number, columnId: string, value: CellValue): void;
}

const EditableCell = ({ value: initialValue, row: { index }, column: { id }, updateData }: EditableCellProps) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue]);

  return (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-label="Edit Value"
      className="w-full whitespace-normal bg-white text-gray-600 text-sm antialiased font-light focus:outline-none focus:ring focus:border-teal-300 rounded leading-normal p-1"
    />
  );
};

export default EditableCell;
