// CanvasHeader.tsx
"use client";

import React, { useState } from "react";
import { Menu, Undo, Redo, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import Logo from "../shared/Logo";
import { useCanvas } from "@/contexts/CanvasContext";
import { useRouter } from "next/navigation";

const CanvasHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}) => {
  const { canvas, updateCanvasName, canvasActions } = useCanvas();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleNameClick = () => {
    if (canvas) {
      setTempName(canvas.name);
      setIsEditing(true);
    }
  };

  const handleNameSave = async () => {
    if (!canvas || !tempName.trim()) return;

    try {
      const res = await fetch(`/api/canvas/${canvas._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tempName }),
      });

      if (res.ok) {
        updateCanvasName(tempName);
        setIsEditing(false);
      }
    } catch (e) {
      alert("Failed to update name");
    }
  };

  const handleSave = async () => {
    if (!canvasActions?.saveCanvas) return;
    await canvasActions.saveCanvas();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-2 py-2">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className={`w-9 h-9 p-0 rounded-lg transition-all ${
              isSidebarOpen
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Logo />

          {isEditing ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-48 h-8 text-sm"
              autoFocus
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded"
            >
              {canvas?.name || "Untitled"}
            </button>
          )}

          {canvas && (
            <div className="text-xs text-gray-500 hidden md:block">
              {canvas.template || "custom"} • {canvas.canvasData.width}×
              {canvas.canvasData.height} {canvas.unit}
            </div>
          )}
        </div>

        {/* Center - Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-lg"
            disabled
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-lg"
            disabled
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            Save
          </Button>

          {canvas?.project && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/project/${canvas.project._id}`)}
            >
              {canvas.project.name}
            </Button>
          )}

          <Button variant="outline" size="sm" disabled>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>

          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CanvasHeader;
