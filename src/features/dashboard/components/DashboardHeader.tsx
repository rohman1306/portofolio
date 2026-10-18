"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TokenDebugDialog from "@/components/shared/TokenDebugDialog";
import { Search, Plus, FolderPlus } from "lucide-react";

export default function DashboardHeader() {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Halo, Baidillah 👋</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-[#0074a6]" size={16} />
          <Input
            placeholder="Cari..."
            className="pl-9 w-64 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#005274] focus-visible:border-[#005274]"
          />
        </div>

        <Button 
          variant="outline" 
          className="bg-white border-[#005274]/30 text-[#005274] hover:bg-[#f0f7fa] hover:text-[#003d57] hover:border-[#005274]/50 font-medium"
          onClick={() => router.push("/allocation")}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Tambah Aset
        </Button>

        <Button 
          className="bg-[#005274] hover:bg-[#003d57] text-white font-medium px-5"
          onClick={() => router.push("/holdings")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Holdings
        </Button>

        <TokenDebugDialog />
      </div>
    </div>
  );
}
