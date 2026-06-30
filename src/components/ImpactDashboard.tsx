import React, { useEffect, useState } from "react";
import { Sparkles, ShieldAlert, TrendingUp, CheckCircle, Lightbulb, UserCheck, RefreshCw, Star } from "lucide-react";
import { Issue, IssueStatus } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

interface ImpactDashboardProps {
  issues: Issue[];
  onRewardXP: (points: number, reason: string) => void;
}

interface AIInsightData {
  neighborhoodRiskLevel: string;
  safetyIndexScore: number;
  predictiveSummary: string;
  hotspots: string[];
  recommendations: Array<{
    task: string;
    audience: string;
    impact: string;
    completed?: boolean;
  }>;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ issues, onRewardXP }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AIInsightData | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issues }),
      });
      if (response.ok) {
        const data = await response.json();
        setInsight(data);
      } else {
        console.error("Failed to load insights");
      }
    } catch (err) {
      console.error("Error fetching AI insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [issues.length]);

  // Aggregate stats for local charts
  const categoriesCount = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoriesCount).map((cat) => ({
    name: cat,
    count: categoriesCount[cat],
  }));

  const statusCount = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCount).map((status) => ({
    name: status,
    value: statusCount[status],
  }));

  const COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#10b981"];

  const resolvedCount = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
  const verifiedCount = issues.filter(i => i.status === IssueStatus.VERIFIED).length;
  const activeCount = issues.filter(i => i.status === IssueStatus.REPORTED).length;
  const progressCount = issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length;

  const handleCompleteTask = (taskTitle: string, index: number) => {
    if (completedTasks[taskTitle]) return;
    setCompletedTasks(prev => ({ ...prev, [taskTitle]: true }));
    onRewardXP(40, `preventative task: "${taskTitle.slice(0, 30)}..."`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner AI Action */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden shadow-xl border border-slate-800 text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3 uppercase tracking-wider">
              <Sparkles size={12} className="fill-indigo-400" />
              Community AI Smart Infrastructure
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none">
              Predictive Insight Hub
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
              Leverage server-side generative artificial intelligence model (gemini-3.5-flash) to evaluate municipal risks, safety metrics, and direct volunteer efforts.
            </p>
          </div>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-950/40 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Analyzing..." : "Refresh Predictive Model"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk & Safety Indicators */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-4">
              Real-time Threat Matrix & Predictive Safety
            </span>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md w-1/3" />
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score indicators */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Safety gauge */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          className="stroke-indigo-600 fill-none transition-all duration-1000" 
                          strokeWidth="6" 
                          strokeDasharray={175}
                          strokeDashoffset={175 - (175 * (insight?.safetyIndexScore || 75)) / 100}
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-slate-800 dark:text-slate-50">
                        {insight?.safetyIndexScore || 75}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Predictive Safety Index</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">Sector Operational</h4>
                    </div>
                  </div>

                  {/* Threat Level */}
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    <ShieldAlert size={18} className="text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Neighborhood Threat</span>
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase">
                        {insight?.neighborhoodRiskLevel || "Moderate"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Brief Text */}
                <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/10">
                  <p className="text-xs text-indigo-950 dark:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 text-[10px]">
                    <Lightbulb size={12} className="text-indigo-600 dark:text-indigo-400" />
                    Civic Impact Summary
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {insight?.predictiveSummary || "Synthesizing municipal report database..."}
                  </p>
                </div>

                {/* Hotspots */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Identified Risk Hotspots</span>
                  <div className="flex flex-wrap gap-2">
                    {insight?.hotspots?.map((hotspot, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-mono font-semibold">
                        📍 {hotspot}
                      </span>
                    )) || <span className="text-xs text-slate-400">Loading risk map coordinates...</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by @google/genai structured outputs</span>
            <span className="font-mono">Model: gemini-3.5-flash</span>
          </div>
        </div>

        {/* Categories Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-4">
            Issue Category Density
          </span>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 italic">No reports submitted to map distribution</p>
            </div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400">Resolved Ratio</span>
              <p className="text-base font-black text-slate-800 dark:text-slate-105">
                {issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400">Verification Rate</span>
              <p className="text-base font-black text-slate-800 dark:text-slate-105">
                {issues.length > 0 ? Math.round(((verifiedCount + resolvedCount) / issues.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Preventative Volunteering Assignments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-indigo-500 fill-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
            Proactive AI Preventative Missions (Get Extra Credits!)
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insight?.recommendations?.map((rec, idx) => {
              const isCompleted = completedTasks[rec.task];
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCompleted 
                      ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 opacity-80"
                      : "bg-slate-50/50 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rec.audience === "City Crew" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                        rec.audience === "Neighborhood Watch" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                        "bg-purple-105 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                      }`}>
                        {rec.audience}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        +40 XP
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-50 leading-snug">
                      {rec.task}
                    </h5>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">
                      {rec.impact}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCompleteTask(rec.task, idx)}
                    disabled={isCompleted}
                    className={`mt-4 w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 cursor-default"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-2xs"
                    }`}
                  >
                    <CheckCircle size={12} className={isCompleted ? "fill-emerald-850" : ""} />
                    <span>{isCompleted ? "Mission Completed!" : "Complete Preventative Mission"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid of secondary micro charts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Alerts</span>
          <p className="text-2xl font-black text-amber-500">{activeCount}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">In Progress</span>
          <p className="text-2xl font-black text-indigo-500">{progressCount}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verified Issues</span>
          <p className="text-2xl font-black text-blue-500">{verifiedCount}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resolved & Saved</span>
          <p className="text-2xl font-black text-emerald-500">{resolvedCount}</p>
        </div>
      </div>
    </div>
  );
};
