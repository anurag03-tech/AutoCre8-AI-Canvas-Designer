"use client";

import CanvasHeader from "@/components/layout/canvasHeader";
import CanvasToolbox from "@/components/layout/canvasToolbox";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 bg-amber-300 overflow-hidden">
        <CanvasToolbox />
        {children}
      </div>
    </div>
  );
};

export default Layout;
