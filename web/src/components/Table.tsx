import React from "react";
import { useTable } from "react-table";

interface TableProps {
  columns: any;
  data: any;
}

const Table = ({ columns, data }: TableProps) => {
  const tableInstance = useTable({ columns, data });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <table className="w-1/2 rounded-md shadow-lg mr-4" {...getTableProps()}>
      <thead className="bg-teal-100">
        {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <th className="text-gray-500 text-sm font-semibold antialiased text-left p-2" {...column.getHeaderProps()}>
                    {// Render the header
                      column.render('Header')}
                  </th>
                ))}
            </tr>
          ))}
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
        {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr {...row.getRowProps()}>
                {// Loop over the rows cells
                  row.cells.map(cell => {
                    // Apply the cell props
                    return (
                      <td className="bg-white text-gray-600 text-sm antialiased font-light border-b p-2" {...cell.getCellProps()}>
                        {// Render the cell contents
                          cell.render('Cell')}
                      </td>
                    )
                  })}
              </tr>
            )
          })}
      </tbody>
    </table>
  );
};

export default Table;
