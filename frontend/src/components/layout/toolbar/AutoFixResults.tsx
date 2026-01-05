// components/layout/toolbar/AutoFixResults.tsx
"use client";

import React from "react";
import { CheckCircle2, Wrench, AlertTriangle, Info } from "lucide-react";

interface AutoFixChange {
  element: string;
  issue: string;
  fix: string;
  success: boolean;
}

interface UnfixableIssue {
  rule: string;
  reason: string;
}

interface AutoFixData {
  fixed: boolean;
  canvasData: any;
  changesMade: AutoFixChange[];
  unfixableIssues: UnfixableIssue[];
}

interface AutoFixResultsProps {
  autoFix: AutoFixData;
}

const AutoFixResults = ({ autoFix }: AutoFixResultsProps) => {
  const successCount = autoFix.changesMade.filter((c) => c.success).length;
  const unfixableCount = autoFix.unfixableIssues.length;

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Overall Status */}
      <div
        className={`p-4 rounded-lg border-2 ${
          autoFix.fixed
            ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-500"
            : "bg-gray-50 border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2">
          {autoFix.fixed ? (
            <>
              <Wrench className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">
                Auto-Fix Applied ✨
              </span>
            </>
          ) : (
            <>
              <Info className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">
                No Fixes Needed
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-2 flex gap-4 text-sm">
          <span className="text-green-700">✓ {successCount} Fixed</span>
          {unfixableCount > 0 && (
            <span className="text-yellow-700">
              ⚠ {unfixableCount} Unfixable
            </span>
          )}
        </div>
      </div>

      {/* Changes Made */}
      {autoFix.changesMade.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Changes Applied
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {autoFix.changesMade.map((change, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-green-50 border border-green-200"
              >
                {/* Element name */}
                <p className="text-sm font-medium text-green-900">
                  {change.element}
                </p>

                {/* Issue */}
                <p className="text-xs text-green-700 mt-1">
                  <span className="font-semibold">Issue:</span> {change.issue}
                </p>

                {/* Fix */}
                <p className="text-xs text-green-700">
                  <span className="font-semibold">Fixed:</span> {change.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unfixable Issues */}
      {autoFix.unfixableIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Couldn't Fix
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {autoFix.unfixableIssues.map((issue, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                {/* Rule */}
                <p className="text-sm font-medium text-yellow-900">
                  {issue.rule}
                </p>

                {/* Reason */}
                <p className="text-xs text-yellow-700 mt-1">
                  <span className="font-semibold">Reason:</span> {issue.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold">
              Changes applied to canvas (not saved)
            </p>
            <p className="mt-1">
              Review the changes and click "Save" in the header to keep them.
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>
          Auto-fix completed at{" "}
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default AutoFixResults;
