import CanvasToolbox from "@/components/layout/canvasToolbox";
import { AIPreviewProvider } from "@/contexts/AIPreviewContext";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <AIPreviewProvider>
      <div className="flex h-full bg-white">
        <CanvasToolbox />
        {children}
      </div>
    </AIPreviewProvider>
  );
};

export default Layout;
