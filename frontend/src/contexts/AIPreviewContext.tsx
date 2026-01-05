// contexts/AIPreviewContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type AIPreviewContextType = {
  isPreviewMode: boolean;
  previewHtml: string | null;
  setPreviewMode: (enabled: boolean) => void;
  setPreviewHtml: (html: string | null) => void;
};

const AIPreviewContext = createContext<AIPreviewContextType | undefined>(
  undefined
);

export const AIPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const setPreviewMode = (enabled: boolean) => {
    setIsPreviewMode(enabled);
    // DON'T CLEAR HTML - Just toggle visibility
    // if (!enabled) {
    //   setPreviewHtml(null);
    // }
  };

  return (
    <AIPreviewContext.Provider
      value={{
        isPreviewMode,
        previewHtml,
        setPreviewMode,
        setPreviewHtml,
      }}
    >
      {children}
    </AIPreviewContext.Provider>
  );
};

export const useAIPreview = () => {
  const context = useContext(AIPreviewContext);
  if (!context) {
    throw new Error("useAIPreview must be used within AIPreviewProvider");
  }
  return context;
};
