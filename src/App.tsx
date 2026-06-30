/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Compass,
  Search,
  Filter,
  CheckCircle,
  Award,
  Flame,
  Shield,
  Zap,
  Crown,
  MapPin,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  ThumbsUp,
  CheckSquare,
  Wrench,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ArrowUpRight,
  Play
} from "lucide-react";
import { motion } from "motion/react";
import { FadingVideo } from "./components/FadingVideo";
import { BlurText } from "./components/BlurText";
import { Issue, IssueStatus, IssueSeverity, UserStats, Coordinates } from "./types";
import { MOCK_ISSUES } from "./mockData";
import { calculateRank, getRankDetails, RANKS_LADDER } from "./utils";
import { BadgeIcon } from "./components/BadgeIcon";
import { IssueCard } from "./components/IssueCard";
import { NeighborhoodMap } from "./components/NeighborhoodMap";
import { ReportIssueModal } from "./components/ReportIssueModal";
import { NagrikSathiChat } from "./components/NagrikSathiChat";
import { ImpactDashboard } from "./components/ImpactDashboard";
import { CitizenProfile } from "./components/CitizenProfile";
import { LaunchScreen } from "./components/LaunchScreen";
import { LeaderboardView } from "./components/LeaderboardView";
import { ComplaintsTracker } from "./components/ComplaintsTracker";
import { WebGLShader } from "../components/ui/web-gl-shader";

export default function App() {
  // State Initialization with local storage fallbacks for durable client persistence
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem("community_hero_issues");
    return saved ? JSON.parse(saved) : MOCK_ISSUES;
  });

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    age: number;
    phone: string;
    city: string;
    email: string;
    username: string;
  } | null>(() => {
    const saved = localStorage.getItem("fixitforward_active_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("community_hero_stats");
    return saved
      ? JSON.parse(saved)
      : {
          points: 35, // Start with some points so they are near a Level Up threshold!
          reportsCount: 1,
          upvotesCount: 2,
          verificationsCount: 1,
          rank: "Civic Novice"
        };
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("fixitforward_search_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [activeMapCoords, setActiveMapCoords] = useState<Coordinates | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [levelUpAlert, setLevelUpAlert] = useState<{
    oldRank: string;
    newRank: string;
    points: number;
  } | null>(null);
  
  // Unified premium dark mode with tricolor wave background
  const darkMode = true;
  const [activeTab, setActiveTab] = useState<"home" | "map" | "leaderboard" | "complaints" | "profile">("home");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("fixitforward_active_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("fixitforward_active_user");
    }
  }, [currentUser]);

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("fixitforward_active_user");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize values relative to viewport center [-0.5 to 0.5]
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem("community_hero_issues", JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem("community_hero_stats", JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem("fixitforward_search_history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Handle scoring increments and level ups
  const addPoints = (amount: number, type: "report" | "upvote" | "verify") => {
    setUserStats((prev) => {
      const newPoints = prev.points + amount;
      const currentRank = prev.rank;
      const updatedRank = calculateRank(newPoints);

      if (updatedRank !== currentRank) {
        // Trigger Level-up Celebration alert!
        setLevelUpAlert({
          oldRank: currentRank,
          newRank: updatedRank,
          points: newPoints
        });
      }

      return {
        points: newPoints,
        reportsCount: prev.reportsCount + (type === "report" ? 1 : 0),
        upvotesCount: prev.upvotesCount + (type === "upvote" ? 1 : 0),
        verificationsCount: prev.verificationsCount + (type === "verify" ? 1 : 0),
        rank: updatedRank
      };
    });
  };

  // Upvote an issue (+5 points)
  const handleUpvote = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId && !issue.hasUpvoted) {
          addPoints(5, "upvote");
          return {
            ...issue,
            upvotes: issue.upvotes + 1,
            hasUpvoted: true
          };
        }
        return issue;
      })
    );
  };

  // Verify an issue (+20 points)
  const handleVerify = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId && !issue.hasVerified) {
          addPoints(20, "verify");
          
          // Determine if we should automatically transition to VERIFIED status
          const nextStatus = issue.status === IssueStatus.REPORTED ? IssueStatus.VERIFIED : issue.status;
          
          const updatedHistory = [...issue.statusHistory];
          if (nextStatus === IssueStatus.VERIFIED && issue.status !== IssueStatus.VERIFIED) {
            updatedHistory.push({
              status: IssueStatus.VERIFIED,
              timestamp: new Date().toISOString(),
              note: "Issue verified by community consensus audit. Moving to Verified queue."
            });
          }

          return {
            ...issue,
            verifications: issue.verifications + 1,
            hasVerified: true,
            status: nextStatus,
            statusHistory: updatedHistory
          };
        }
        return issue;
      })
    );
  };

  // Volunteer matchmaking for extra credits
  const handleVolunteer = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId && !issue.hasVolunteered) {
          addPoints(30, "upvote");
          const updatedHistory = [...issue.statusHistory];
          updatedHistory.push({
            status: issue.status,
            timestamp: new Date().toISOString(),
            note: `${currentUser?.name || "Diana Prince"} matched as active volunteer to expedite resolution schedule.`
          });
          return {
            ...issue,
            hasVolunteered: true,
            volunteerCount: (issue.volunteerCount || 0) + 1,
            statusHistory: updatedHistory
          };
        }
        return issue;
      })
    );
  };

  // Add a comment to an issue and reward +10 XP
  const handleAddComment = (issueId: string, text: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const newComment = {
            id: Math.random().toString(36).substring(2, 9),
            author: currentUser?.name || "Diana Prince",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
            text,
            timestamp: new Date().toISOString()
          };
          const updatedComments = issue.comments ? [...issue.comments, newComment] : [newComment];
          
          // Reward XP for active community conversation engagement
          addPoints(10, "upvote");
          
          return {
            ...issue,
            comments: updatedComments
          };
        }
        return issue;
      })
    );
  };

  // Add search query to history list
  const handleAddSearchToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  // Focus and scroll map into position on mobile
  const handleFocusLocation = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setActiveMapCoords(issue.location);

    // Smooth scroll map into view on smaller viewports
    const mapElement = document.getElementById("civic-grid-map");
    if (mapElement && window.innerWidth < 768) {
      mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Custom coordinate selection from Map clicks
  const handleMapClickCoords = (coords: Coordinates) => {
    setActiveMapCoords(coords);
    setIsReportModalOpen(true);
  };

  // Create new issue from form submission (+10 points)
  const handleCreateIssueSubmit = (issueData: Omit<Issue, "id" | "reportedAt" | "upvotes" | "verifications" | "status" | "statusHistory" | "hasUpvoted" | "hasVerified">) => {
    const newIssue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      upvotes: 0,
      verifications: 0,
      status: IssueStatus.REPORTED,
      statusHistory: [
        {
          status: IssueStatus.REPORTED,
          timestamp: new Date().toISOString(),
          note: `Issue submitted by ${issueData.reportedBy}. Coordinates logged: [${issueData.location.lat.toFixed(4)}, ${issueData.location.lng.toFixed(4)}].`
        }
      ],
      hasUpvoted: false,
      hasVerified: false
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    addPoints(10, "report");
    setActiveMapCoords(null);
  };

  // City Action Simulator Panel - Allows users to demo status progressions (Verified -> In Progress -> Resolved)
  const handleTransitionStatus = (issueId: string, nextStatus: IssueStatus) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const timestamp = new Date().toISOString();
          let note = "";

          switch (nextStatus) {
            case IssueStatus.VERIFIED:
              note = "Municipal bureau verified structural elements. Added to repair queues.";
              break;
            case IssueStatus.IN_PROGRESS:
              note = "City Public Works dispatch crew has been assigned and is actively investigating/working on the site.";
              break;
            case IssueStatus.RESOLVED:
              note = "Repairs successfully executed by Municipal Crews. Inspection completed. Closed.";
              break;
            default:
              note = "Status updated via municipality management panel.";
          }

          return {
            ...issue,
            status: nextStatus,
            statusHistory: [
              ...issue.statusHistory,
              { status: nextStatus, timestamp, note }
            ]
          };
        }
        return issue;
      })
    );

    // Give rewards points for administrative transitions
    if (nextStatus === IssueStatus.VERIFIED) {
      addPoints(10, "verify");
    } else if (nextStatus === IssueStatus.IN_PROGRESS) {
      addPoints(15, "verify");
    } else if (nextStatus === IssueStatus.RESOLVED) {
      addPoints(30, "verify");
    }
  };

  // Reset demo states
  const handleResetDemo = () => {
    if (window.confirm("Are you sure you want to restore the default mock issues and score?")) {
      localStorage.removeItem("community_hero_issues");
      localStorage.removeItem("community_hero_stats");
      setIssues(MOCK_ISSUES);
      setUserStats({
        points: 35,
        reportsCount: 1,
        upvotesCount: 2,
        verificationsCount: 1,
        rank: "Civic Novice"
      });
      setSelectedIssueId(null);
      setActiveMapCoords(null);
    }
  };

  // Filter and search logic
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.address && issue.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;
    const matchesSeverity = selectedSeverity === "All" || issue.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const currentSelectedIssue = issues.find((issue) => issue.id === selectedIssueId) || null;
  const rankMeta = getRankDetails(userStats.points);

  // Available Category filter list
  const categories = [
    "All",
    "Road & Pavement",
    "Street Lighting",
    "Water & Utilities",
    "Parks & Recreation",
    "Public Art & Graffiti",
    "Trash & Sanitation"
  ];

  const statuses = ["All", IssueStatus.REPORTED, IssueStatus.VERIFIED, IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED];
  const severities = ["All", IssueSeverity.LOW, IssueSeverity.MEDIUM, IssueSeverity.HIGH, IssueSeverity.CRITICAL];

  if (!currentUser) {
    return (
      <div className="dark">
        <WebGLShader />
        <LaunchScreen
          onLoginSuccess={(profile) => {
            setCurrentUser(profile);
            setActiveTab("home");
          }}
          mousePos={mousePos}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans flex flex-col relative dark">
      <WebGLShader />
      
      {/* Cool Hover-Sensitive Animated Indian Flag Background Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-20 dark:opacity-[0.12] transition-opacity duration-300">
        {/* Saffron Glowing Aura in top right */}
        <div 
          className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-[#FF9933] to-amber-500/10 blur-3xl mix-blend-multiply dark:mix-blend-screen transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px) scale(1.1)`,
          }}
        />
        {/* Green Glowing Aura in bottom left */}
        <div 
          className="absolute -bottom-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-[#128807] to-emerald-600/10 blur-3xl mix-blend-multiply dark:mix-blend-screen transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 45}px) scale(1.1)`,
          }}
        />
        {/* Middle Soft White glow to ensure Tricolor completeness */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-white/20 dark:bg-slate-900/10 blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 10}px), calc(-50% + ${mousePos.y * 10}px))`,
          }}
        />
        {/* Spinning Ashoka Chakra Wireframe Outline */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] border-4 border-[#000080]/15 dark:border-indigo-400/10 rounded-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 25}px), calc(-50% + ${mousePos.y * 25}px)) rotate(${mousePos.x * 40}deg)`,
          }}
        >
          <div className="absolute w-full h-full animate-spin-slow" style={{ animationDuration: '80s' }}>
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-1/2 left-1/2 w-[2px] h-1/2 bg-[#000080]/12 dark:bg-indigo-400/8 origin-top"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 15}deg)`,
                }}
              />
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-4 border-[#000080]/15 dark:border-indigo-400/12 bg-transparent" />
          </div>
        </div>
      </div>
      
      {/* Dynamic Celebration Alert for Gamified Level-Up */}
      {levelUpAlert && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setLevelUpAlert(null)} />
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 max-w-sm w-full z-10 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Crown className="text-indigo-600 dark:text-indigo-400 animate-bounce" size={40} />
            </div>
            
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">Rank Achieved!</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">Level Up!</h3>
            
            <p className="text-xs text-slate-500 mt-2">
              Your points reached <strong className="text-slate-900 dark:text-slate-100">{levelUpAlert.points} XP</strong>! You have climbed from <span className="italic">{levelUpAlert.oldRank}</span> to:
            </p>
 
            <div className="my-5 inline-block">
              <BadgeIcon type="rank" value={levelUpAlert.newRank} size="lg" />
            </div>
 
            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              "{RANKS_LADDER.find(r => r.name === levelUpAlert.newRank)?.description || ""}"
            </p>
 
            <button
              onClick={() => setLevelUpAlert(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-100 cursor-pointer"
            >
              Awesome, keep reporting!
            </button>
          </div>
        </div>
      )}
 
      {/* Main Top Navigation Headboard */}
      <header className="sticky top-0 z-40 bg-black border-b border-slate-800 transition-all select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between relative z-10">
          
          {/* App Brand Logo with Tricolor style */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-750 flex items-center justify-center text-white shadow-md shadow-indigo-100/40 dark:shadow-none shrink-0">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-black tracking-tighter text-slate-950 dark:text-slate-50 leading-none flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-[#FF9933] via-slate-800 to-[#128807] dark:via-slate-100 bg-clip-text text-transparent transition-transform duration-300 hover:scale-[1.03]">
                  FixItforWard
                </span>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/55 text-[#128807] dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/40 px-2 py-0.5 rounded-md font-black tracking-widest uppercase shrink-0">
                  IN
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-tight">Fix it for your Ward, your City, your INDIA and YOU.</p>
            </div>
          </div>

          {/* Header Action Elements */}
          <div className="flex items-center gap-3">

            {/* Quick Report Trigger */}
            <button
              onClick={() => {
                setActiveMapCoords({ lat: 45.5200 + (Math.random() - 0.5) * 0.005, lng: -122.6795 + (Math.random() - 0.5) * 0.005 });
                setIsReportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Report Issue</span>
            </button>

          </div>
        </div>

        {/* Tab Selection Row (Navbar at top under the name) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 flex gap-1 overflow-x-auto pb-0 select-none">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 sm:px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "home"
                ? "bg-black border-t border-x border-slate-800 text-indigo-400 font-extrabold -mb-[1px]"
                : "text-slate-500 hover:text-slate-250 dark:hover:text-slate-200"
            }`}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 sm:px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "map"
                ? "bg-black border-t border-x border-slate-800 text-indigo-400 font-extrabold -mb-[1px]"
                : "text-slate-500 hover:text-slate-250 dark:hover:text-slate-200"
            }`}
          >
            <span>🗺️</span>
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 sm:px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "leaderboard"
                ? "bg-black border-t border-x border-slate-800 text-indigo-400 font-extrabold -mb-[1px]"
                : "text-slate-500 hover:text-slate-250 dark:hover:text-slate-200"
            }`}
          >
            <span>🏆</span>
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-4 sm:px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "complaints"
                ? "bg-black border-t border-x border-slate-800 text-indigo-400 font-extrabold -mb-[1px]"
                : "text-slate-500 hover:text-slate-250 dark:hover:text-slate-200"
            }`}
          >
            <span>📁</span>
            <span>Complaints</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 sm:px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-black border-t border-x border-slate-800 text-indigo-400 font-extrabold -mb-[1px]"
                : "text-slate-500 hover:text-slate-250 dark:hover:text-slate-200"
            }`}
          >
            <span>👤</span>
            <span>Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content Stage Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">

        {activeTab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            
            {/* CENTRAL FEED: Search, filter sliders and list feed */}
            <div className="lg:col-span-12 flex flex-col gap-5 max-w-4xl mx-auto w-full">
              
              {/* Search Filters Control Hub */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-left">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal size={14} className="text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest">
                    Filter & Search Control Hub
                  </h3>
                </div>

                {/* Text Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by keywords, title, description, or address (Press Enter to save)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddSearchToHistory(searchQuery);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Search History Chips */}
                {searchHistory.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400 font-semibold shrink-0 uppercase tracking-wider text-[9px]">Recent:</span>
                    {searchHistory.map((hist, idx) => (
                      <span
                        key={idx}
                        onClick={() => setSearchQuery(hist)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 cursor-pointer transition-all border border-slate-200/50 dark:border-slate-750"
                      >
                        {hist}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchHistory((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="hover:text-rose-500 font-bold px-0.5 text-[8px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSearchHistory([])}
                      className="text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-wider ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Categorical & Multi-Select Sliders */}
                <div className="space-y-3">
                  {/* Horizontal Category Pill Tabs */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Category Selector</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-2 pr-1 scrollbar-thin">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub Dropdown Filters */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st === "All" ? "All Statuses" : st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Impact Severity</label>
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                      >
                        {severities.map((sev) => (
                          <option key={sev} value={sev}>
                            {sev === "All" ? "All Severities" : `${sev} Severity`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Issue Admin Simulator action drawer */}
              {currentSelectedIssue && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800 text-left animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        City Action Hub — Admin Simulator
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedIssueId(null)}
                      className="text-[10px] text-slate-400 hover:text-white bg-slate-800/40 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold line-clamp-1 text-slate-200">
                        Managing: {currentSelectedIssue.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Transition this issue through its public life cycle to demonstrate the StatusStepper!
                      </p>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {/* Dispath to In-Progress */}
                      {currentSelectedIssue.status === IssueStatus.VERIFIED && (
                        <button
                          onClick={() => handleTransitionStatus(currentSelectedIssue.id, IssueStatus.IN_PROGRESS)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Wrench size={10} />
                          Simulate Dispatch
                        </button>
                      )}

                      {/* Resolve issue */}
                      {currentSelectedIssue.status === IssueStatus.IN_PROGRESS && (
                        <button
                          onClick={() => handleTransitionStatus(currentSelectedIssue.id, IssueStatus.RESOLVED)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle size={10} />
                          Simulate Resolve
                        </button>
                      )}

                      {/* Quick reset status */}
                      {currentSelectedIssue.status === IssueStatus.RESOLVED && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-1.5 rounded-lg">
                          <CheckCircle size={10} /> Resolved & Completed!
                        </span>
                      )}

                      {currentSelectedIssue.status === IssueStatus.REPORTED && (
                        <p className="text-[10px] text-amber-400 font-semibold italic bg-amber-950/20 px-2 py-1.5 rounded-lg">
                          ⚠️ Verify this issue below first to start the city work queues!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Issue Cards Listings Header Feed */}
              <div className="flex items-center justify-between text-left select-none">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    Active Civic Reports
                    <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-full">
                      {filteredIssues.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">Showing filtered coordinates</p>
                </div>
              </div>

              {/* List Feed */}
              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onUpvote={handleUpvote}
                      onVerify={handleVerify}
                      onFocusLocation={handleFocusLocation}
                      onVolunteer={handleVolunteer}
                      onAddComment={handleAddComment}
                      isFocused={selectedIssueId === issue.id}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HelpCircle size={20} className="text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No civic issues found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Try relaxing your keywords, toggling category sliders, or click the map directly to submit a new report!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="space-y-4 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between select-none">
              <div>
                <h2 className="text-base font-black text-slate-950 dark:text-slate-50 tracking-tight">
                  🗺️ Interactive Ward Topology Map
                </h2>
                <p className="text-[11px] text-slate-400">
                  Click on map coordinates directly to submit a geo-tagged report immediately.
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span> Report Custom Coords
              </button>
            </div>
            
            <div className="h-[calc(100vh-230px)] min-h-[500px] w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden shadow-xs relative">
              <NeighborhoodMap
                issues={issues}
                selectedIssueId={selectedIssueId}
                onSelectIssue={(id) => {
                  setSelectedIssueId(id);
                  const card = document.getElementById(`issue-card-${id}`);
                  if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }
                }}
                onMapClickCoords={handleMapClickCoords}
                activeCoords={activeMapCoords}
              />
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-in fade-in duration-300 w-full">
            <LeaderboardView 
              stats={userStats} 
              userProfile={currentUser} 
              issues={issues}
              onRewardXP={(points) => {
                addPoints(points, "upvote");
              }}
            />
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="animate-in fade-in duration-300">
            <ComplaintsTracker 
              issues={issues}
              currentUser={currentUser}
              onTransitionStatus={handleTransitionStatus}
              onFocusLocation={(issue) => {
                handleFocusLocation(issue);
                setActiveTab("map");
              }}
            />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Level & Rank Gamified Progress Dashbord Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Stats Breakdown left side */}
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
                <div className="relative shrink-0 select-none">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center border border-indigo-100/40">
                    <Crown className="text-indigo-600 dark:text-indigo-400" size={32} />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 rounded-full shadow-md">
                    LVL
                  </span>
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Current Contributor Level</span>
                    <BadgeIcon type="rank" value={userStats.rank} size="sm" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">
                    {userStats.points} <span className="text-slate-400 font-medium">Total XP</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 leading-normal max-w-md mt-0.5">
                    "{rankMeta.current.description}"
                  </p>
                </div>
              </div>

              {/* XP Progress Bar Gauge center side */}
              <div className="flex-1 w-full max-w-md text-left">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <TrendingUp size={12} className="text-indigo-500" />
                    Next milestone
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {rankMeta.next ? (
                      <>
                        <strong>{userStats.points}</strong> / {rankMeta.next.minPoints} XP
                      </>
                    ) : (
                      "Max level reached!"
                    )}
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${rankMeta.progress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-slate-400">
                  <span>{rankMeta.current.name}</span>
                  {rankMeta.next ? (
                    <span>{rankMeta.pointsNeeded} XP remaining for <strong>{rankMeta.next.name}</strong></span>
                  ) : (
                    <span>Level Max</span>
                  )}
                </div>
              </div>

              {/* Gamified Contribution score cards */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 select-none">
                <div className="text-center md:text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Reports</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{userStats.reportsCount}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 block">+10 XP ea.</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Upvotes</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{userStats.upvotesCount}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 block">+5 XP ea.</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Verified</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{userStats.verificationsCount}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 block">+20 XP ea.</span>
                </div>
              </div>
            </section>

            <CitizenProfile 
              stats={userStats} 
              userProfile={currentUser}
              onSignOut={handleSignOut}
            />
          </div>
        )}

      </main>

      {/* Floating instructions bar for small devices */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-6 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} FixItforWard Network. Built for responsive civic awareness.</p>
          <p className="font-mono text-[10px] text-slate-300 dark:text-slate-700">Sector EPSG:4326 | Lat bounds [45.5130, 45.5340] — Lng bounds [-122.6920, -122.6520]</p>
        </div>
      </footer>

      {/* Report Modal Component */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setActiveMapCoords(null);
        }}
        onSubmit={handleCreateIssueSubmit}
        initialCoords={activeMapCoords}
      />

      {/* NagrikSathi AI Chatbot Component */}
      <NagrikSathiChat />
    </div>
  );
}
