import React from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

export function DataTable<T extends object>({ columns, data }: { columns: ColumnDef<T>[], data: T[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-2xl bg-slate-900 overflow-hidden">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-[#111825] border-b border-slate-700/60 text-xs tracking-widest uppercase text-slate-400">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className="px-6 py-4 font-semibold shrink-0">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-slate-800/80 transition-colors duration-200">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                  {col.cell ? col.cell(row) : (row[col.accessorKey] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
