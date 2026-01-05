import CanvasToolbox from "@/components/layout/canvasToolbox";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col justify-between h-full  bg-white border-r shadow-lg transition-all duration-300 ">
      <div className="flex flex-row h-full">
        <CanvasToolbox />

        {children}
      </div>
    </div>
  );
};

export default Layout;
