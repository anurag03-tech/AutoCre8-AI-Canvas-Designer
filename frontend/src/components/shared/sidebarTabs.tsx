import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type SidebarTabsProps = {
  title: string;
  Icon: LucideIcon;
  href: string;
  isActive?: boolean;
  collapsed?: boolean;
};

const SidebarTabs = ({
  title,
  Icon,
  href,
  isActive,
  collapsed = false,
}: SidebarTabsProps) => {
  return (
    <Link href={href}>
      <div
        className={`
        flex items-center rounded-xl transition-all duration-300 cursor-pointer
        ${
          isActive
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-blue-100 text-slate-800"
        }
        hover:bg-blue-500 hover:text-white hover:shadow-md
        ${collapsed ? "flex-col gap-1 p-2" : "flex-row gap-3 py-3 px-4"}  
      `}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <div
          className={`font-medium whitespace-nowrap transition-all duration-300 ${
            collapsed ? "text-[10px] text-center" : "text-base"
          }`}
        >
          {title}
        </div>
      </div>
    </Link>
  );
};

export default SidebarTabs;
