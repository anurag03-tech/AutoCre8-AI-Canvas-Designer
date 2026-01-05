"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Save,
  FileCheck,
  Wand2,
} from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";
import ComplianceResults from "./ComplianceResults";
import AutoFixResults from "./AutoFixResults";

const CompliancePanel = () => {
  const { canvas, updateCanvas, canvasActions } = useCanvas();
  const [complianceRules, setComplianceRules] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [autoFixResults, setAutoFixResults] = useState<any>(null);

  useEffect(() => {
    if (canvas?.complianceRules) {
      setComplianceRules(canvas.complianceRules);
    }
  }, [canvas]);

  const handleSaveRules = async () => {
    if (!canvas?._id) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/canvas/${canvas._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complianceRules }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save compliance rules");
      }
    } catch (error) {
      console.error("Error saving rules:", error);
      alert("Error saving compliance rules");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!canvas?._id) return;

    if (!complianceRules.trim()) {
      alert("Please enter compliance rules first");
      return;
    }

    setIsValidating(true);
    setValidationResults(null);
    setAutoFixResults(null);

    try {
      const fabricCanvas = (window as any).__fabricCanvas;
      let canvasScreenshot = null;

      if (fabricCanvas) {
        try {
          canvasScreenshot = fabricCanvas.toDataURL({
            format: "png",
            quality: 0.8,
            multiplier: 1,
          });
        } catch (error) {
          console.warn("Failed to capture screenshot:", error);
        }
      }

      const response = await fetch(
        `/api/canvas/${canvas._id}/validate-compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ canvasScreenshot }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setValidationResults(data.validation);
      } else {
        alert(data.error || "Validation failed");
      }
    } catch (error) {
      console.error("Validation error:", error);
      alert("Error validating design");
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoFix = async () => {
    if (!canvas?._id) return;

    if (!complianceRules.trim()) {
      alert("Please enter compliance rules first");
      return;
    }

    // ✅ Check if canvasActions is available
    if (!canvasActions?.loadCanvasJSON) {
      alert("Canvas not ready. Please wait a moment.");
      return;
    }

    setIsAutoFixing(true);
    setAutoFixResults(null);
    setValidationResults(null);

    try {
      const fabricCanvas = (window as any).__fabricCanvas;
      let canvasScreenshot = null;

      if (fabricCanvas) {
        try {
          canvasScreenshot = fabricCanvas.toDataURL({
            format: "png",
            quality: 0.8,
            multiplier: 1,
          });
        } catch (error) {
          console.warn("Failed to capture screenshot:", error);
        }
      }

      console.log("🔧 Starting auto-fix...");

      const response = await fetch(
        `/api/canvas/${canvas._id}/auto-fix-compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ canvasScreenshot }),
        }
      );

      const data = await response.json();

      if (data.success && data.autoFix.fixed) {
        console.log("✅ Auto-fix successful!");
        console.log("Fixed canvas data:", data.autoFix.canvasData);
        console.log("Objects count:", data.autoFix.canvasData?.objects?.length);

        setAutoFixResults(data.autoFix);

        // ✅ VALIDATE canvas data
        if (
          !data.autoFix.canvasData ||
          !data.autoFix.canvasData.objects ||
          !Array.isArray(data.autoFix.canvasData.objects)
        ) {
          console.error(
            "❌ Invalid canvas data from AI:",
            data.autoFix.canvasData
          );
          alert("Invalid canvas data received from AI. Canvas not updated.");
          return;
        }

        if (data.autoFix.canvasData.objects.length === 0) {
          console.warn("⚠️ Canvas has no objects!");
          alert("Warning: Fixed canvas has no objects. Not applying changes.");
          return;
        }

        console.log("🎨 Updating canvas via React state...");

        // ✅ FIX: Update canvas context state instead of direct manipulation
        // This will trigger useFabricCanvas to reload the canvas properly
        updateCanvas({
          canvasData: data.autoFix.canvasData,
        });

        console.log("✅ Canvas state updated! Hook will reload canvas.");
      } else if (data.success && !data.autoFix.fixed) {
        alert("No fixes were needed or possible");
        setAutoFixResults(data.autoFix);
      } else {
        console.error("❌ Auto-fix failed:", data);
        alert(data.error || "Auto-fix failed");
      }
    } catch (error) {
      console.error("Auto-fix error:", error);
      alert("Error during auto-fix");
    } finally {
      setIsAutoFixing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-indigo-600" />
        <h3 className="text-md font-semibold">Design Compliance</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          Enter your design compliance rules. AI can validate or automatically
          fix issues.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ">
          Compliance Rules
        </label>
        <Textarea
          value={complianceRules}
          onChange={(e) => setComplianceRules(e.target.value)}
          placeholder="Example: - Headline text must be between 60-100px
- Logo must be present in top-left corner
- Minimum 20px margin from all edges
- Text must be readable (no low contrast)"
          className="min-h-[200px] max-h-[300px] text-sm font-mono"
          disabled={isSaving || isValidating || isAutoFixing}
        />
        <p className="text-xs text-gray-500">
          {complianceRules.length} characters
        </p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleSaveRules}
          disabled={isSaving || !complianceRules.trim()}
          className="w-full cursor-pointer"
          variant="outline "
        >
          {isSaving ? (
            <>Saving...</>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Rules
            </>
          )}
        </Button>

        <Button
          onClick={handleValidate}
          disabled={isValidating || isAutoFixing || !complianceRules.trim()}
          className="w-full cursor-pointer"
          variant="outline"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
              Validating...
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Validate Design
            </>
          )}
        </Button>

        <Button
          onClick={handleAutoFix}
          disabled={isAutoFixing || isValidating || !complianceRules.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white cursor-pointer"
        >
          {isAutoFixing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Auto-Fixing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-Fix Design
            </>
          )}
        </Button>
      </div>

      {validationResults && (
        <ComplianceResults validation={validationResults} />
      )}

      {autoFixResults && <AutoFixResults autoFix={autoFixResults} />}
    </div>
  );
};

export default CompliancePanel;
