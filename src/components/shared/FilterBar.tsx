"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string | null) => void }[];
}

export default function FilterBar({ searchValue, onSearchChange, filters }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-9 w-56 bg-card border-border"
        />
        {searchValue && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
      {filters?.map((f) => (
        <Select key={f.label} value={f.value} onValueChange={f.onChange}>
          <SelectTrigger className="w-36 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
