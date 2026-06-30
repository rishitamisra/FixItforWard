/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, AlertCircle, ShieldCheck, Wrench, CheckCircle2, Circle } from "lucide-react";
import { IssueStatus, StatusHistoryEntry } from "../types";

interface StatusStepperProps {
  currentStatus: IssueStatus;
  history: StatusHistoryEntry[];
}

const STATUS_ORDER = [
  IssueStatus.REPORTED,
  IssueStatus.VERIFIED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLVED
];

const STATUS_METADATA = {
  [IssueStatus.REPORTED]: {
    label: "Reported",
    description: "Citizen submitted report with details and coordinates.",
    icon: AlertCircle,
    color: "bg-amber-500 text-white",
    borderColor: "border-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/20"
  },
  [IssueStatus.VERIFIED]: {
    label: "Verified",
    description: "Community trust score met or validated by peers.",
    icon: ShieldCheck,
    color: "bg-blue-500 text-white",
    borderColor: "border-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/20"
  },
  [IssueStatus.IN_PROGRESS]: {
    label: "In Progress",
    description: "Assigned to department crew for resolution.",
    icon: Wrench,
    color: "bg-indigo-500 text-white",
    borderColor: "border-indigo-500",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/20"
  },
  [IssueStatus.RESOLVED]: {
    label: "Resolved",
    description: "Issue resolved and validated. Thank you, Heroes!",
    icon: CheckCircle2,
    color: "bg-emerald-500 text-white",
    borderColor: "border-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/20"
  }
};

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, history }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="w-full">
      {/* Stepper Line/Bubbles - Horizontal Desktop, Vertical Mobile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-2 select-none">
        {STATUS_ORDER.map((status, index) => {
          const metadata = STATUS_METADATA[status];
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = metadata.icon;
          
          // Find matching history entry
          const historyEntry = history.find(h => h.status === status);

          return (
            <div key={status} className="flex-1 flex flex-row md:flex-col items-start md:items-center relative">
              {/* Connector Line for horizontal on desktop */}
              {index < STATUS_ORDER.length - 1 && (
                <div 
                  className={`hidden md:block absolute top-5 left-[50%] right-[-50%] h-0.5 z-0 transition-all duration-500 ${
                    index < currentIndex ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  }`} 
                />
              )}
              
              {/* Connector Line for vertical on mobile */}
              {index < STATUS_ORDER.length - 1 && (
                <div 
                  className={`block md:hidden absolute left-5 top-10 bottom-[-16px] w-0.5 z-0 transition-all duration-500 ${
                    index < currentIndex ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  }`} 
                />
              )}

              {/* Status Circle Bubble */}
              <div className="z-10 shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent
                      ? `${metadata.borderColor} ${metadata.color} shadow-lg shadow-indigo-100 dark:shadow-none scale-110 ring-4 ring-offset-2 ring-indigo-500/20`
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
              </div>

              {/* Status Label and details */}
              <div className="ml-4 md:ml-0 md:mt-2 text-left md:text-center flex-1">
                <h4 
                  className={`text-xs font-semibold ${
                    isCurrent 
                      ? "text-slate-900 dark:text-slate-50 font-bold" 
                      : isCompleted 
                      ? "text-slate-700 dark:text-slate-200" 
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {metadata.label}
                </h4>
                
                {historyEntry ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    {formatDate(historyEntry.timestamp)}
                  </p>
                ) : isCurrent ? (
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold animate-pulse mt-0.5">
                    Active Step
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                    Pending
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History log detailing the status updates */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-left">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
          Activity Logs & Status Details
        </span>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {history.length > 0 ? (
            history.slice().reverse().map((entry, index) => (
              <div key={index} className="text-xs border-b border-slate-100/60 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between font-medium">
                  <span className={`font-semibold ${
                    entry.status === IssueStatus.RESOLVED ? "text-emerald-600 dark:text-emerald-400" :
                    entry.status === IssueStatus.IN_PROGRESS ? "text-indigo-600 dark:text-indigo-400" :
                    entry.status === IssueStatus.VERIFIED ? "text-blue-600 dark:text-blue-400" :
                    "text-amber-600 dark:text-amber-400"
                  }`}>
                    {entry.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                    {entry.note}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
