import React from "react";
import { cn } from "./cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyField: (row: T) => string | number;
  emptySlot?: React.ReactNode;
  className?: string;
}

/**
 * Lightweight generic table for flat read-lists (the ~45 admin mock pages).
 * Complex layouts (kanban, chat, card grids) keep their custom markup.
 */
export function DataTable<T>({ columns, rows, keyField, emptySlot, className }: DataTableProps<T>) {
  if (rows.length === 0 && emptySlot) return <>{emptySlot}</>;

  return (
    <div className={cn("glass-panel rounded-2xl overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3.5 font-semibold", c.headerClassName)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={keyField(row)} className="hover:bg-white/[0.02] transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 text-slate-300", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}