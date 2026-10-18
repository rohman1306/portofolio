"use client";

import { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/format";
import { Allocation } from "../types/allocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AllocationTableProps {
  allocations: Allocation[];
  totalDana: number;
}

export default function AllocationTable({ allocations, totalDana }: AllocationTableProps) {
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();

  const columns = useMemo<ColumnDef<Allocation, unknown>[]>(
    () => [
      {
        accessorKey: "kategori",
        header: t("common.category"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.original.warna }} />
            <span className="text-foreground">{row.original.kategori}</span>
          </div>
        ),
      },
      {
        accessorKey: "jumlah_dana",
        header: () => <span className="text-right block">{t("allocation.fundAmount")}</span>,
        cell: ({ row }) => {
          const actualPct = totalDana > 0 ? (row.original.jumlah_dana / totalDana) * 100 : 0;
          return <span className="text-right block text-muted-foreground">{formatCurrency(row.original.jumlah_dana, currency, rate)}</span>;
        },
      },
      {
        id: "aktualPersen",
        header: () => <span className="text-right block">{t("allocation.actualPercent")}</span>,
        cell: ({ row }) => {
          const pct = totalDana > 0 ? (row.original.jumlah_dana / totalDana) * 100 : 0;
          return <span className="text-right block text-muted-foreground">{pct.toFixed(1)}%</span>;
        },
      },
      {
        accessorKey: "target_persentase",
        header: () => <span className="text-right block">{t("allocation.targetPercent")}</span>,
        cell: ({ row }) => <span className="text-right block text-muted-foreground">{row.original.target_persentase}%</span>,
      },
      {
        id: "selisih",
        header: () => <span className="text-right block">{t("allocation.difference")}</span>,
        cell: ({ row }) => {
          const pct = totalDana > 0 ? (row.original.jumlah_dana / totalDana) * 100 : 0;
          const selisih = pct - row.original.target_persentase;
          return (
            <span className={`text-right block ${selisih >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {selisih >= 0 ? "+" : ""}{selisih.toFixed(1)}%
            </span>
          );
        },
      },
    ],
    [t, totalDana, currency, rate]
  );

  const table = useReactTable({
    data: allocations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t("allocation.detailTitle")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left py-3 px-3 text-muted-foreground font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
