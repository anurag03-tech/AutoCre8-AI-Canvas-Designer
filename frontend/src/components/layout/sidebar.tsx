"use client";

import React from "react";
import SidebarTabs from "../shared/sidebarTabs";
import Logo from "../shared/Logo";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";
import { SIDEBAR_CONFIG, ROUTES } from "@/lib/constants";

const Sidebar = ({ collapsed = false }: { collapsed?: boolean }) => {
  const pathName = usePathname();

  return (
    <div
      className={`flex flex-col justify-between h-full p-2 bg-white border-r shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col gap-4  overflow-y-auto">
        <div className="px-2">{!collapsed && <Logo />}</div>
        <div className="flex flex-col gap-2">
          {SIDEBAR_CONFIG.map(({ title, Icon, href }) => (
            <SidebarTabs
              key={title}
              title={title}
              Icon={Icon}
              href={href}
              isActive={pathName === href}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
