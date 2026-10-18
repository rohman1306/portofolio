"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function SidebarItem({
  title,
  href,
  icon: Icon,
  layoutIdPrefix = "desktop",
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  layoutIdPrefix?: string;
}) {
  const pathname = usePathname();
  // Check if current path matches item route
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-xl px-4 py-3 min-h-11 text-sm font-medium transition-colors duration-300 ${
        isActive 
          ? "text-[#005274] font-semibold" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {/* Sliding Active Pill Animation */}
      {isActive && (
        <motion.div
          layoutId={`${layoutIdPrefix}-active-sidebar-pill`}
          className="absolute inset-0 bg-[#f0f7fa] border-l-4 border-[#005274] rounded-xl -z-10"
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      
      <Icon 
        size={20} 
        className={`transition-colors duration-300 ${isActive ? "text-[#005274]" : "text-slate-400 group-hover:text-slate-600"}`} 
      />
      <span className="relative z-10">{title}</span>
    </Link>
  );
}
