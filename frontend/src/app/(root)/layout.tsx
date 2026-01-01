// layout.tsx
"use client";

import Header from "@/components/layout/header";
import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <SessionProvider>
        <div className="flex-1">{children}</div>
      </SessionProvider>
    </div>
  );
};

export default layout;
