import CanvasToolbox from "@/components/layout/canvasToolbox";
import { AIPreviewProvider } from "@/contexts/AIPreviewContext";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <AIPreviewProvider>
      <div className="flex flex-col justify-between h-full bg-white border-r shadow-lg transition-all duration-300">
        <div className="flex flex-row h-full overflow-x-auto overflow-y-hidden">
          <div className="flex flex-row flex-shrink-0">
            <CanvasToolbox />
            {children}
          </div>
        </div>
      </div>
    </AIPreviewProvider>
  );
};

export default Layout;
