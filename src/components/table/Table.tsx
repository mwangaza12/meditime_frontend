import { useState, useEffect } from "react";
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
  onSelectionChange?: (selectedIds: string[]) => void; // ✅ added prop
}

export function Table<T extends { id: string }>({
  columns,
  data,
  loading = false,
  error = false,
  emptyText = "No records found.",
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Notify parent when selected IDs change
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds));
    }
  }, [selectedIds, onSelectionChange]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load data.</p>;
  if (data.length === 0) return <p className="p-4 text-slate-500">{emptyText}</p>;

  return (
    <div className="w-full overflow-x-auto rounded-md border-slate-200">
      <table className="min-w-full table-auto text-sm text-left border rounded-md divide-y divide-slate-200">
        <thead className="bg-blue-100">
          <tr>
            {selectable && <th className="px-4 py-3 w-10"></th>}
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
          {data.map((row) => (
            <tr
              key={row.id}
              className={clsx("hover:bg-slate-50 transition-colors", {
                "bg-slate-100": selectedIds.has(row.id),
              })}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
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
