import React from "react";
import { Award, ShieldCheck, Zap, Trophy, Star, Medal, Sparkles, User, Mail, Phone, MapPin, Calendar, LogOut } from "lucide-react";
import { UserStats } from "../types";
import { getRankDetails } from "../utils";

interface CitizenProfileProps {
  stats: UserStats;
  userProfile?: {
    name: string;
    age: number;
    phone: string;
    city: string;
    email: string;
    username: string;
  } | null;
  onSignOut?: () => void;
}

export const CitizenProfile: React.FC<CitizenProfileProps> = ({ stats, userProfile, onSignOut }) => {
  const currentRankDetails = getRankDetails(stats.rank);
  
  // Define badges based on the user's points
  const BADGES = [
    {
      id: "bronze",
      name: "Bronze Patrol Badge",
      pointsRequired: 30,
      description: "Granted for making initial neighborhood contributions.",
      icon: Medal,
      color: "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      id: "silver",
      name: "Silver Watcher Badge",
      pointsRequired: 75,
      description: "Given to active citizens monitoring public safety.",
      icon: Award,
      color: "text-slate-400 border-slate-300 bg-slate-50 dark:bg-slate-900/20",
    },
    {
      id: "gold",
      name: "Gold Guardian Badge",
      pointsRequired: 150,
      description: "Honors dedicated leaders verifying community issues.",
      icon: Trophy,
      color: "text-yellow-500 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      id: "diamond",
      name: "Diamond Community Hero",
      pointsRequired: 300,
      description: "Unlocks the official Civic Verification Checkmark.",
      icon: ShieldCheck,
      color: "text-indigo-500 border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20",
    },
  ];

  const profileName = userProfile?.name || "Diana Prince";
  const profileUsername = userProfile?.username || "citizen";
  const profileAge = userProfile?.age || 28;
  const profilePhone = userProfile?.phone || "+91 98765 43210";
  const profileCity = userProfile?.city || "Bengaluru";
  const profileEmail = userProfile?.email || "diana@fixitforward.in";

  const hasDiamondBadge = stats.points >= 300;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Left Column: Citizen Identity Card & Contact Parameters */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center relative z-10">
            {/* Avatar & Verification Indicator */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
                alt={profileName}
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/40"
                referrerPolicy="no-referrer"
              />
              {hasDiamondBadge ? (
                <div 
                  title="Official Verified Civic Expert"
                  className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-tr from-amber-500 to-indigo-600 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md cursor-help"
                >
                  <ShieldCheck size={16} />
                </div>
              ) : (
                <div 
                  title="Citizen Status: Leveling Up"
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-md cursor-help"
                >
                  <Star size={14} className="fill-white" />
                </div>
              )}
            </div>

            {/* Name & Rank */}
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-4 flex items-center gap-1.5 justify-center">
              {profileName}
              {hasDiamondBadge && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  ✓ Verified Expert
                </span>
              )}
            </h3>
            
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">
              {stats.rank}
            </p>

            {/* Points Gauge Bar */}
            <div className="w-full mt-6 bg-slate-50 dark:bg-slate-800/40 rounded-full p-1 border border-slate-100 dark:border-slate-800/80">
              <div 
                className="bg-indigo-600 text-[10px] font-black text-white text-center p-1 leading-none rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.points / 350) * 100)}%` }}
              >
                {stats.points} XP
              </div>
            </div>
            
            <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-slate-400">
              <span>0 XP (Novice)</span>
              <span>350 XP (Diamond Peak)</span>
            </div>
          </div>

          {/* Secure Personal Contact Details Panel */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User size={13} className="text-indigo-500" />
              <span>Citizen Identity File</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  Username:
                </span>
                <span className="font-mono font-bold text-slate-850 dark:text-slate-200">@{profileUsername}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> Age Group:
                </span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{profileAge} Years</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> Phone:
                </span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{profilePhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> Ward City:
                </span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{profileCity}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> Email ID:
                </span>
                <span className="font-bold text-slate-850 dark:text-slate-200 truncate max-w-[170px]" title={profileEmail}>
                  {profileEmail}
                </span>
              </div>
            </div>

            {/* Log Out button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full mt-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Switch / Sign Out Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Columns: Badge Milestones and perks */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Badge Milestones Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-4">
            Your Civic Badge Progression & Rewards
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = stats.points >= badge.pointsRequired;
              const BadgeIconEl = badge.icon;

              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                    isUnlocked 
                      ? `${badge.color} border-slate-200 dark:border-slate-800 shadow-xs`
                      : "bg-slate-50/50 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className={`p-2.5 rounded-2xl shrink-0 ${
                    isUnlocked ? "bg-white/80 dark:bg-slate-950/40" : "bg-slate-200 dark:bg-slate-800"
                  }`}>
                    <BadgeIconEl size={22} className={isUnlocked ? "" : "text-slate-400"} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-950 dark:text-slate-50">
                        {badge.name}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      {badge.description}
                    </p>
                    <p className="text-[9px] font-mono font-bold text-slate-400 mt-2">
                      Requires: {badge.pointsRequired} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diamond Verification Info Box */}
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-150/40 dark:border-indigo-900/20 flex items-start gap-2.5">
            <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-indigo-950 dark:text-indigo-300">Verification Road:</span> Once you reach the <span className="font-semibold">Diamond Community Hero Badge</span> (300 XP), you acquire the official Verification Checkmark. Verified citizens receive exclusive administrative rights to transition issue status direct to <span className="font-bold text-emerald-600">Resolved</span>!
            </p>
          </div>
        </div>

        {/* Active Rank Perks card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rank Perks & Multipliers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <Zap size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-50">Score multiplier:</span>
                <p className="text-slate-500 leading-normal mt-0.5">
                  Your active 1.0x score multiplier rewards you +10 XP for reporting, +5 XP for upvotes, and +20 XP for verifying.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <ShieldCheck size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-50">Validation Consensus:</span>
                <p className="text-slate-500 leading-normal mt-0.5">
                  Your active reviews and upvotes contribute heavily to the {profileCity} regional infrastructure resolution metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
