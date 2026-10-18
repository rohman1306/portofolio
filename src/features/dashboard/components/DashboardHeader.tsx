"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TokenDebugDialog from "@/components/shared/TokenDebugDialog";
import { Search, Plus, FolderPlus } from "lucide-react";

export default function DashboardHeader() {
  const router = useRouter();
  
  return (
    <div className="mb-2 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Halo, Baidillah 👋</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[140px] sm:flex-none sm:w-auto">
          <Search className="absolute left-3 top-2.5 text-[#0074a6]" size={16} />
          <Input
            placeholder="Cari..."
            className="w-full sm:w-56 lg:w-64 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#005274] focus-visible:border-[#005274] pl-9"
          />
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="bg-white border-[#005274]/30 text-[#005274] hover:bg-[#f0f7fa] hover:text-[#003d57] hover:border-[#005274]/50 font-medium whitespace-nowrap"
          onClick={() => router.push("/allocation")}
        >
          <FolderPlus className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden xs:inline">Tambah Aset</span>
          <span className="xs:hidden">Aset</span>
        </Button>

        <Button 
          size="sm"
          className="bg-[#005274] hover:bg-[#003d57] text-white font-medium px-2.5 sm:px-5 whitespace-nowrap"
          onClick={() => router.push("/holdings")}
        >
          <Plus className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Holdings</span>
        </Button>

        <TokenDebugDialog />
      </div>
    </div>
  );
}
