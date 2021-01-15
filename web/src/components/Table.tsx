import React, { useState } from "react";
import { FaPlusCircle, FaSearch, FaCaretDown, FaCaretUp, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useTable, usePagination, useFilters, useSortBy } from "react-table";
import Modal, { FormValues } from "./Modal";

interface TableProps {
  columns: any;
  data: any;
  tableName: string;
  filterName: string;
}

const Table = ({ columns, data, tableName, filterName }: TableProps) => {
  const [filterInput, setFilterInput] = useState("");
  const [showModal, setShowModal] = useState(false);
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
  // Modal
  const handleToggleModal = () => { setShowModal(!showModal) };
  const handleCreateModal = (modalData: FormValues) => {
    setShowModal(!showModal);
    console.log(modalData);
    //createData(modalData)
  };

  return (
    <>
      <div className="flex justify-between bg-white px-4 py-2 mb-4">
        <div className="flex">
          <h1 className="text-orange-500 font-bold text-3xl mr-4">
            {tableName}
          </h1>
          <button
            type="button"
            title="Add New"
            onClick={handleToggleModal}
            className="text-orange-500"
          >
            <FaPlusCircle size={22} />
          </button>
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
      {/* Pagination can be built however you'd like. This is just a very basic UI implementation: */}
      <div className="flex justify-between items-center mx-2 my-4">
        <span className="text-gray-500 text-sm antialiased font-semibold p-2">
          Page{' '}<span>{pageIndex + 1} of {pageCount}</span>
        </span>
        <span className="text-gray-500 text-sm antialiased font-semibold p-2">{'Total:'}{' '}{rows.length}</span>
        <div className="text-gray-500 bg-teal-100 rounded-lg border text-sm antialiased font-semibold">
          <button type="button" onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="p-2 border-r">
            <FaAngleDoubleLeft size={18} />
          </button>
          <button type="button" onClick={() => previousPage()} disabled={!canPreviousPage} className="p-2 border-r">
            <FaChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => nextPage()} disabled={!canNextPage} className="p-2 border-r">
            <FaChevronRight size={18} />
          </button>
          <button type="button" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="p-2">
            <FaAngleDoubleRight size={18} />
          </button>
        </div>
      </div>
      <Modal
        show={showModal}
        tableName={tableName}
        onClose={handleToggleModal}
        onCreate={handleCreateModal}
      />
    </>
  );
};

export default Table;
