import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Wrench, 
  CheckCircle, 
  Clock, 
  FileText, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { Issue, IssueStatus, IssueSeverity } from "../types";
import { StatusStepper } from "./StatusStepper";

interface ComplaintsTrackerProps {
  issues: Issue[];
  currentUser: {
    name: string;
    username: string;
  } | null;
  onTransitionStatus: (issueId: string, nextStatus: IssueStatus) => void;
  onFocusLocation: (issue: Issue) => void;
}

export const ComplaintsTracker: React.FC<ComplaintsTrackerProps> = ({
  issues,
  currentUser,
  onTransitionStatus,
  onFocusLocation
}) => {
  const [filterType, setFilterType] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | IssueStatus>("All");
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  const currentUserName = currentUser?.name || "Diana Prince";

  // Filter complaints
  const filteredIssues = issues.filter((issue) => {
    // 1. Filter by owner (mine vs all)
    if (filterType === "mine") {
      const isMine = issue.reportedBy.toLowerCase() === currentUserName.toLowerCase() ||
                    issue.reportedBy.toLowerCase() === "diana prince";
      if (!isMine) return false;
    }

    // 2. Filter by search query (title, address, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchAddr = issue.address?.toLowerCase().includes(q) || false;
      const matchCat = issue.category.toLowerCase().includes(q);
      if (!matchTitle && !matchAddr && !matchCat) return false;
    }

    // 3. Filter by status
    if (selectedStatus !== "All" && issue.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  // Status Badge Helper
  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.REPORTED:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40";
      case IssueStatus.VERIFIED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40";
      case IssueStatus.IN_PROGRESS:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/40";
      case IssueStatus.RESOLVED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            🏛️ Real-Time Complaints Tracking Desk
          </h2>
          <p className="text-xs text-slate-400">
            Monitor, inspect, and track structural resolution phases across municipal wards.
          </p>
        </div>

        {/* My vs All Toggle Button */}
        <div className="flex bg-slate-100/70 dark:bg-slate-900/40 p-1 rounded-xl gap-1 border border-slate-200/40 dark:border-slate-800/40 shrink-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Ward Reports ({issues.length})
          </button>
          <button
            onClick={() => setFilterType("mine")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterType === "mine"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Submissions
          </button>
        </div>
      </div>

      {/* Filters Hub Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Field */}
        <div className="relative md:col-span-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search complaints by title, ward category, or location tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="md:col-span-4 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value={IssueStatus.REPORTED}>Reported</option>
            <option value={IssueStatus.VERIFIED}>Verified</option>
            <option value={IssueStatus.IN_PROGRESS}>In-Progress</option>
            <option value={IssueStatus.RESOLVED}>Resolved</option>
          </select>
        </div>

      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;
            
            // Format time elapsed
            const timeFormatted = new Date(issue.reportedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <div 
                key={issue.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs transition-all ${
                  isExpanded 
                    ? "border-indigo-200 dark:border-indigo-900/60 ring-2 ring-indigo-500/5" 
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-750"
                }`}
              >
                {/* Upper Summary Header */}
                <div 
                  onClick={() => toggleExpand(issue.id)}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {issue.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        • {timeFormatted}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-950 dark:text-slate-50 tracking-tight leading-snug mt-1">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin size={11} className="text-indigo-500 shrink-0" />
                      <span>{issue.address || "Logged Coordinates Sector"}</span>
                    </p>
                  </div>

                  {/* Right hand side action and caret */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusLocation(issue);
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-bold rounded-xl border border-slate-100 dark:border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin size={10} />
                      <span>Focus Map</span>
                    </button>

                    <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tracking Lifecycle detail drawer */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
                    
                    {/* Status Stepper visualization */}
                    <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/30">
                      <StatusStepper currentStatus={issue.status} history={issue.statusHistory} />
                    </div>

                    {/* Meta Parameters Grid (Details, estimates, notes) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      {/* Left: Complaint file record */}
                      <div className="space-y-3 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <FileText size={13} className="text-indigo-500" />
                          <span>Civic File Record</span>
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          "{issue.description}"
                        </p>
                        <div className="grid grid-cols-2 gap-3.5 pt-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Reported By:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{issue.reportedBy}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Category:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{issue.category}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Severity Index:</span>
                            <span className="font-bold text-rose-500">{issue.severity}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Peer Reviews:</span>
                            <span className="font-bold text-indigo-500">{issue.verifications} Verifications</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Resolution Estimator and Status Logs */}
                      <div className="space-y-3 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Clock size={13} className="text-indigo-500" />
                            <span>Resolution Estimate & Logs</span>
                          </h4>
                          
                          {/* Live estimate tracker */}
                          <div className="mt-3 flex items-center gap-2">
                            <Clock className="text-amber-500 shrink-0" size={16} />
                            <div>
                              <span className="text-slate-500 block text-[10px]">Estimated Resolution:</span>
                              <span className="font-black text-slate-800 dark:text-slate-200 text-xs">
                                {issue.status === IssueStatus.RESOLVED 
                                  ? "Successfully Resolved & Audited" 
                                  : issue.status === IssueStatus.IN_PROGRESS 
                                  ? "24 - 48 Hours (Crew Dispatched)" 
                                  : issue.status === IssueStatus.VERIFIED 
                                  ? "3 - 5 Days (Pending Crew Dispatch)" 
                                  : "7 - 10 Days (Awaiting Peer Verification)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Admin Simulator Action Panel right inside the expanded complaint card */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 block mb-2">
                            City Command Simulation Hub
                          </span>
                          
                          <div className="flex flex-wrap gap-2">
                            {issue.status === IssueStatus.REPORTED && (
                              <p className="text-[10px] text-amber-500 italic bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/10">
                                ⚠️ Peer verification is required. Click "Verify" on the main card or leaderboard to accelerate resolution queues.
                              </p>
                            )}

                            {issue.status === IssueStatus.VERIFIED && (
                              <button
                                onClick={() => onTransitionStatus(issue.id, IssueStatus.IN_PROGRESS)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                <Wrench size={11} />
                                <span>Dispatch Work Crew</span>
                              </button>
                            )}

                            {issue.status === IssueStatus.IN_PROGRESS && (
                              <button
                                onClick={() => onTransitionStatus(issue.id, IssueStatus.RESOLVED)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                <CheckCircle size={11} />
                                <span>Complete Repairs</span>
                              </button>
                            )}

                            {issue.status === IssueStatus.RESOLVED && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-xl">
                                <CheckCircle size={11} /> Resolution Verified & Completed!
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-900 select-none">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={20} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">No matching reports found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filterType === "mine" 
                ? "You haven't reported any civic complaints yet. Click 'Report Issue' in the header to register your first report!" 
                : "No complaints found. Try clearing your status filters or input queries."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
