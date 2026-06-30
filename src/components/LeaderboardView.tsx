import React, { useState } from "react";
import { 
  Trophy, 
  Medal, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  BarChart3, 
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  Map
} from "lucide-react";
import { UserStats } from "../types";
import { ImpactDashboard } from "./ImpactDashboard";
import { getRankDetails } from "../utils";

interface LeaderboardUser {
  name: string;
  points: number;
  rank: string;
  avatar: string;
  isSelf?: boolean;
}

interface LeaderboardViewProps {
  stats: UserStats;
  userProfile?: {
    name: string;
    city: string;
    email?: string;
    username?: string;
  } | null;
  issues: any[];
  onRewardXP: (points: number, reason: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  stats, 
  userProfile, 
  issues, 
  onRewardXP 
}) => {
  const [subTab, setSubTab] = useState<"ranking" | "analytics">("ranking");

  // Dynamically assemble the leaderboard including the currently logged-in user
  const displayName = userProfile?.name || "Diana Prince";
  const userCity = userProfile?.city || "Bengaluru";

  const LEADERBOARD_RAW: LeaderboardUser[] = [
    { name: "Aarav Sharma (Pothole Crusader)", points: 420, rank: "Community Hero", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" },
    { name: `${displayName} (You)`, points: stats.points, rank: stats.rank, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", isSelf: true },
    { name: "Priya Patel", points: 310, rank: "Local Guardian", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { name: "Inspector Suresh Kumar", points: 280, rank: "Local Guardian", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { name: "Eco Warrior Tyler", points: 195, rank: "Active Citizen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
    { name: "Aditi Iyer", points: 125, rank: "Active Citizen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
    { name: "Rohan Das", points: 80, rank: "Civic Novice", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150" }
  ];

  // Sort by points to find the correct standings
  const sortedLeaderboard = [...LEADERBOARD_RAW].sort((a, b) => b.points - a.points);
  const selfRankIdx = sortedLeaderboard.findIndex(u => u.isSelf);

  // Take the top 3 for the beautiful pedestal layout
  const podium = sortedLeaderboard.slice(0, 3);
  
  // Custom rank metadata
  const rankDetails = getRankDetails(stats.points);

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      
      {/* Header bar with tab selector matching other components */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Trophy size={20} className="fill-indigo-500/10" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
              Community Hero Standing
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join hands with neighbors to report issues and improve local municipal care.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800">
          <button
            onClick={() => setSubTab("ranking")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "ranking"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <Users size={14} />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setSubTab("analytics")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "analytics"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 size={14} />
            <span>Civic Impact Analytics</span>
          </button>
        </div>
      </div>

      {subTab === "ranking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Top 3 Podiums Showcase */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Top 3 Podium Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-6 self-start">
                <Sparkles size={16} className="text-amber-500 fill-amber-500/20" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Podium Standings
                </h3>
              </div>

              {/* Pedestal visual */}
              <div className="flex items-end justify-center gap-4 w-full h-44 select-none mb-4">
                
                {/* 2nd Place */}
                {podium[1] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative group cursor-help" title={`Rank 2: ${podium[1].name}`}>
                      <img
                        src={podium[1].avatar}
                        alt={podium[1].name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-2 -left-1 text-[11px] bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        2
                      </span>
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                      {podium[1].name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      {podium[1].points} XP
                    </span>
                    <div className="w-full bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/80 h-14 rounded-t-2xl mt-2 flex flex-col items-center justify-center">
                      <Medal size={14} className="text-slate-400" />
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {podium[0] && (
                  <div className="flex flex-col items-center flex-1 scale-105 z-10">
                    <div className="relative group cursor-help" title={`Rank 1: ${podium[0].name}`}>
                      <img
                        src={podium[0].avatar}
                        alt={podium[0].name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-amber-400 dark:border-amber-400/80 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-2 -left-1 text-[12px] bg-amber-400 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        👑
                      </span>
                    </div>
                    <span className="text-xs font-black mt-2 text-amber-600 dark:text-amber-400 truncate max-w-[90px]">
                      {podium[0].name.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-mono font-black text-amber-500">
                      {podium[0].points} XP
                    </span>
                    <div className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border-t-2 border-indigo-400/50 h-20 rounded-t-2xl mt-2 flex flex-col items-center justify-center shadow-xs">
                      <Trophy size={18} className="text-amber-500 fill-amber-500/10 animate-bounce" />
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative group cursor-help" title={`Rank 3: ${podium[2].name}`}>
                      <img
                        src={podium[2].avatar}
                        alt={podium[2].name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-700/50 dark:border-amber-900/60 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-2 -left-1 text-[11px] bg-amber-700 dark:bg-amber-800 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        3
                      </span>
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                      {podium[2].name.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      {podium[2].points} XP
                    </span>
                    <div className="w-full bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/80 h-10 rounded-t-2xl mt-2 flex flex-col items-center justify-center">
                      <Medal size={14} className="text-amber-750" />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Current Active Citizen Progress Status Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Your Civic Level Progress
                </h3>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-slate-900 dark:text-slate-50">
                  {stats.rank}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.points} XP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${rankDetails.progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span>{rankDetails.current.minPoints} XP</span>
                <span>{rankDetails.next ? `${rankDetails.next.minPoints} XP` : "Max Rank"}</span>
              </div>

              {rankDetails.next ? (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    Earn <strong className="text-slate-850 dark:text-slate-200 font-bold">{rankDetails.pointsNeeded} more XP</strong> to unlock <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{rankDetails.next.name}</strong> rank privileges.
                  </p>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    Congratulations! You have reached the peak of the civic ladder. Keep up the amazing work!
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Full Standings List Index */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Municipal Standings Index
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850">
                ACTIVE DISTRICT: {userCity.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              {sortedLeaderboard.map((user, idx) => {
                const isTopThree = idx < 3;
                const hasDiamondCheck = user.points >= 300;
                
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      user.isSelf 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                        : "bg-white dark:bg-transparent border-slate-100 dark:border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Index */}
                      <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        idx === 0 
                          ? "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" 
                          : idx === 1 
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" 
                          : idx === 2 
                          ? "bg-amber-700/10 dark:bg-amber-900/10 text-amber-700 dark:text-amber-600" 
                          : "text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>

                      {/* Avatar */}
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`w-9 h-9 rounded-full object-cover border ${
                          user.isSelf ? "border-indigo-400" : "border-slate-200 dark:border-slate-700"
                        }`}
                        referrerPolicy="no-referrer"
                      />

                      {/* Info block */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          {user.name}
                          {user.isSelf && (
                            <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                          {hasDiamondCheck && (
                            <ShieldCheck size={14} className="text-indigo-500" title="Verified Civic Hero" />
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                          {user.rank}
                        </p>
                      </div>
                    </div>

                    {/* XP Tag */}
                    <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 px-3 py-1.5 rounded-xl">
                      {user.points} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {subTab === "analytics" && (
        <div className="animate-in fade-in duration-300">
          <ImpactDashboard 
            issues={issues}
            onRewardXP={(points, reason) => {
              onRewardXP(points, reason);
            }}
          />
        </div>
      )}

    </div>
  );
};
