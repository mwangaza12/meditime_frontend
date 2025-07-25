import { useState } from "react";
import { clsx } from "clsx";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  onHeaderClick?: () => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: boolean;
  emptyText?: string;
  selectable?: boolean;
}

export function Table<T>({columns,data,loading = false,error = false,emptyText = "No records found.",selectable = false,}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load data.</p>;
  if (data.length === 0) return <p className="p-4 text-slate-500">{emptyText}</p>;

  return (
    <div className="w-full overflow-x-auto rounded-md border-slate-200">
    <table className="min-w-full table-auto text-sm text-left border rounded-md divide-y divide-slate-200">
        <thead className="bg-blue-100">
          <tr>
            {selectable && <th className="px-4 py-3"></th>}
            {columns.map((col, idx) => (
              <th
                key={idx}
                onClick={col.onHeaderClick}
                className={clsx(
                  "px-4 py-3 text-left font-semibold text-blue-800 whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={clsx("hover:bg-slate-50 transition-colors", {
                "bg-slate-100": selectedRows.includes(rowIndex),
              })}
            >
              {selectable && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => toggleRow(rowIndex)}
                    className="checkbox checkbox-sm"
                  />
                </td>
              )}
              {columns.map((col, colIndex) => {
                const content =
                  typeof col.accessor === "function"
                    ? col.accessor(row)
                    : col.accessor
                    ? (row[col.accessor] as React.ReactNode)
                    : null;

                return (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-slate-700 whitespace-nowrap"
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
