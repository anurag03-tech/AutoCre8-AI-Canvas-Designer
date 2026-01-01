"use client";

import Sidebar from "@/components/layout/sidebar";
import CanvasHeader from "@/components/layout/canvasHeader";
import React, { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { CanvasProvider } from "@/contexts/CanvasContext";

const Layout = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();
  const isCreatePage = pathName.startsWith("/canvas");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showSidebar = isCreatePage ? sidebarOpen : true;

  return (
    <CanvasProvider>
      <div className="flex flex-col h-screen">
        {isCreatePage && (
          <CanvasHeader
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />
        )}

        {/* 👇 fills remaining height after header */}
        <div className="flex flex-1 min-h-0">
          {showSidebar && <Sidebar collapsed={isCreatePage} />}

          {/* 👇 child gets ONLY available height */}
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </CanvasProvider>
  );
};

export default Layout;
