import React, { useState } from "react";
import { FaSearch, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { useTable, usePagination, useFilters, useSortBy } from "react-table";
import AddButton from "./AddButton";

interface TableProps {
  columns: any;
  data: any;
  tableName: string;
  filterName: string;
}

const Table = ({ columns, data, tableName, filterName }: TableProps) => {
  const [filterInput, setFilterInput] = useState("");
  const tableInstance = useTable({ columns, data }, useFilters, useSortBy, usePagination);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    initialState,
    state: { pageIndex, pageSize },
    setFilter,
  } = tableInstance;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined;
    setFilter(filterName, value);
    setFilterInput(e.target.value);
  }

  return (
    <>
      <div className="flex justify-between bg-white px-4 py-2 mb-4">
        <div className="flex">
          <h1 className="text-orange-500 font-bold text-3xl mr-4">
            {tableName}
          </h1>
          <AddButton title={tableName} />
        </div>
        <div className="flex items-center text-gray-500 text-sm antialiased font-semibold">
          Display
          <select
            className="outline-none appearance-none mx-2 py-2 px-4 bg-gray-200"
            value={pageSize}
            aria-label="Select Page Size"
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center border p-2">
          <FaSearch size={16} />
          <input
            value={filterInput}
            onChange={handleFilterChange}
            placeholder={"Search..."}
            aria-label="Search a column"
            type='text'
            className="outline-none text-sm antialiased font-light px-4"
          />
        </div>
      </div>

      <table className="w-full rounded-md shadow-lg mr-4" {...getTableProps()}>
        <thead className="bg-teal-100">
          {// Loop over the header rows
            headerGroups.map(headerGroup => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                  headerGroup.headers.map(column => (
                    // Apply the header cell props
                    <th className="text-gray-500 text-sm font-semibold antialiased text-left p-2" {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {/* Add a sort direction indicator */}
                      <span className="inline-block">{column.render("Header")}</span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? <FaCaretDown size={16} className="inline-block ml-2" />
                          : <FaCaretUp size={16} className="inline-block ml-2" />
                        : ""}
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
    </>
  );
};

export default Table;
