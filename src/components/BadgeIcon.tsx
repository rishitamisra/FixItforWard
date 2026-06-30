/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";
import { IssueStatus, IssueSeverity } from "../types";

interface BadgeIconProps {
  type: "status" | "severity" | "category" | "rank";
  value: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  type,
  value,
  className = "",
  size = "md"
}) => {
  // Map value to Lucide Icon
  let IconComponent: React.ComponentType<any> = Icons.HelpCircle;
  let colorClass = "bg-slate-100 text-slate-800 border-slate-200";

  if (type === "status") {
    switch (value) {
      case IssueStatus.REPORTED:
        IconComponent = Icons.AlertCircle;
        colorClass = "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
        break;
      case IssueStatus.VERIFIED:
        IconComponent = Icons.ShieldCheck;
        colorClass = "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
        break;
      case IssueStatus.IN_PROGRESS:
        IconComponent = Icons.Wrench;
        colorClass = "bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
        break;
      case IssueStatus.RESOLVED:
        IconComponent = Icons.CheckCircle2;
        colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
        break;
    }
  } else if (type === "severity") {
    switch (value) {
      case IssueSeverity.LOW:
        IconComponent = Icons.ArrowDown;
        colorClass = "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
        break;
      case IssueSeverity.MEDIUM:
        IconComponent = Icons.ArrowRight;
        colorClass = "bg-yellow-50 text-yellow-800 border border-yellow-200/60 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30";
        break;
      case IssueSeverity.HIGH:
        IconComponent = Icons.ArrowUp;
        colorClass = "bg-orange-50 text-orange-800 border border-orange-200/60 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30";
        break;
      case IssueSeverity.CRITICAL:
        IconComponent = Icons.Flame;
        colorClass = "bg-rose-50 text-rose-800 border border-rose-200 animate-pulse dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30";
        break;
    }
  } else if (type === "category") {
    const categoryLower = value.toLowerCase();
    if (categoryLower.includes("road") || categoryLower.includes("pavement") || categoryLower.includes("pothole")) {
      IconComponent = Icons.Construction;
      colorClass = "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400";
    } else if (categoryLower.includes("light") || categoryLower.includes("lamp")) {
      IconComponent = Icons.Lightbulb;
      colorClass = "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400";
    } else if (categoryLower.includes("water") || categoryLower.includes("leak") || categoryLower.includes("utility")) {
      IconComponent = Icons.Droplet;
      colorClass = "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400";
    } else if (categoryLower.includes("park") || categoryLower.includes("rec") || categoryLower.includes("tree")) {
      IconComponent = Icons.Trees;
      colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
    } else if (categoryLower.includes("graffiti") || categoryLower.includes("art") || categoryLower.includes("paint")) {
      IconComponent = Icons.Palette;
      colorClass = "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-950/20 dark:text-fuchsia-400";
    } else if (categoryLower.includes("trash") || categoryLower.includes("waste") || categoryLower.includes("sanitation")) {
      IconComponent = Icons.Trash2;
      colorClass = "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400";
    } else {
      IconComponent = Icons.HelpCircle;
      colorClass = "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }
  } else if (type === "rank") {
    switch (value) {
      case "Civic Novice":
        IconComponent = Icons.Sparkles;
        colorClass = "bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold";
        break;
      case "Neighborhood Watcher":
        IconComponent = Icons.Eye;
        colorClass = "bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold";
        break;
      case "Active Citizen":
        IconComponent = Icons.Zap;
        colorClass = "bg-amber-100 text-amber-700 border border-amber-200 font-bold";
        break;
      case "Local Guardian":
        IconComponent = Icons.Shield;
        colorClass = "bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold";
        break;
      case "Community Hero":
        IconComponent = Icons.Crown;
        colorClass = "bg-rose-100 text-rose-700 border border-rose-200 font-bold animate-bounce-subtle";
        break;
    }
  }

  const paddingClass = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight shadow-xs transition-all ${colorClass} ${paddingClass} ${className}`}
    >
      <IconComponent size={iconSize} className="shrink-0" />
      {value}
    </span>
  );
};
