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
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Fixed Header */}
        {isCreatePage && (
          <div className="shrink-0">
            <CanvasHeader
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              isSidebarOpen={sidebarOpen}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Fixed Sidebar */}
          {showSidebar && (
            <div className="shrink-0 h-full">
              <Sidebar collapsed={isCreatePage} />
            </div>
          )}

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </CanvasProvider>
  );
};

export default Layout;
