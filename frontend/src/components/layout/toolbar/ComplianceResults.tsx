// components/layout/toolbar/ComplianceResults.tsx
"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ValidationIssue {
  rule: string;
  status: "pass" | "fail" | "warning";
  message: string;
  suggestion?: string;
}

interface ValidationResponse {
  passed: boolean;
  issues: ValidationIssue[];
}

interface ComplianceResultsProps {
  validation: ValidationResponse;
}

const ComplianceResults = ({ validation }: ComplianceResultsProps) => {
  const passCount = validation.issues.filter((i) => i.status === "pass").length;
  const failCount = validation.issues.filter((i) => i.status === "fail").length;
  const warnCount = validation.issues.filter(
    (i) => i.status === "warning"
  ).length;

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Overall Status */}
      <div
        className={`p-4 rounded-lg border-2 ${
          validation.passed
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-500"
        }`}
      >
        <div className="flex items-center gap-2">
          {validation.passed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">
                Design Compliant ✓
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">
                Compliance Issues Found
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-2 flex gap-4 text-sm">
          <span className="text-green-700">✓ {passCount} Passed</span>
          {failCount > 0 && (
            <span className="text-red-700">✗ {failCount} Failed</span>
          )}
          {warnCount > 0 && (
            <span className="text-yellow-700">⚠ {warnCount} Warnings</span>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {validation.issues.map((issue, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              issue.status === "pass"
                ? "bg-green-50 border-green-200"
                : issue.status === "fail"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            {/* Status Icon & Rule */}
            <div className="flex items-start gap-2 mb-2">
              {issue.status === "pass" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : issue.status === "fail" ? (
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    issue.status === "pass"
                      ? "text-green-900"
                      : issue.status === "fail"
                      ? "text-red-900"
                      : "text-yellow-900"
                  }`}
                >
                  {issue.rule}
                </p>
              </div>
            </div>

            {/* Message */}
            <p
              className={`text-xs ml-6 ${
                issue.status === "pass"
                  ? "text-green-700"
                  : issue.status === "fail"
                  ? "text-red-700"
                  : "text-yellow-700"
              }`}
            >
              {issue.message}
            </p>

            {/* Suggestion (for failures/warnings) */}
            {issue.suggestion && (
              <div className="mt-2 ml-6 p-2 bg-white rounded border border-gray-200">
                <p className="text-xs text-gray-700">
                  <strong className="text-indigo-600">Suggestion:</strong>{" "}
                  {issue.suggestion}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>
          Validation completed at{" "}
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ComplianceResults;
