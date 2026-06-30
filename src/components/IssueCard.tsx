/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ThumbsUp,
  CheckSquare,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Share2,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Twitter
} from "lucide-react";
import { Issue, IssueStatus, IssueSeverity } from "../types";
import { BadgeIcon } from "./BadgeIcon";
import { StatusStepper } from "./StatusStepper";

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string) => void;
  onVerify: (id: string) => void;
  onFocusLocation: (issue: Issue) => void;
  onVolunteer: (id: string) => void;
  onAddComment?: (issueId: string, text: string) => void;
  isFocused?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onUpvote,
  onVerify,
  onFocusLocation,
  onVolunteer,
  onAddComment,
  isFocused = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPointsBubble, setShowPointsBubble] = useState<"upvote" | "verify" | "volunteer" | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPointsEarned, setCommentPointsEarned] = useState(false);

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!issue.hasUpvoted) {
      setShowPointsBubble("upvote");
      setTimeout(() => setShowPointsBubble(null), 1200);
      onUpvote(issue.id);
    }
  };

  const handleVerifyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!issue.hasVerified) {
      setShowPointsBubble("verify");
      setTimeout(() => setShowPointsBubble(null), 1200);
      onVerify(issue.id);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mockUrl = `${window.location.origin}/issue/${issue.id}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShareNextdoor = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`🚨 Neighborhood Alert on FixItforWard: "${issue.title}". Let's get together and verify this issue at ${issue.address || "our neighborhood"}!`);
    window.open(`https://nextdoor.com/share?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`🚨 Civic report on FixItforWard: "${issue.title}" located at ${issue.address || "our ward"}. Help us upvote and resolve!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleEmailWard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = encodeURIComponent(`Civic Issue Report: ${issue.title} (ID: ${issue.id})`);
    const body = encodeURIComponent(`Dear Ward Councilor,\n\nI am writing to draw your attention to a civic issue reported on the FixItforWard network:\n\nTitle: ${issue.title}\nCategory: ${issue.category}\nSeverity: ${issue.severity}\nAddress: ${issue.address || "Not specified"}\nDescription: ${issue.description}\n\nWe would appreciate your help in prioritizing this for our community's safety and well-being.\n\nBest regards,\nDiana Prince`);
    window.open(`mailto:wardcouncilor@city.gov?subject=${subject}&body=${body}`);
    setShowShareMenu(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(issue.id, commentText.trim());
      setCommentText("");
      setCommentPointsEarned(true);
      setTimeout(() => setCommentPointsEarned(false), 2000);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Assign background color based on severity
  const getSeverityBorder = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return "border-l-4 border-l-rose-500";
      case IssueSeverity.HIGH:
        return "border-l-4 border-l-orange-500";
      case IssueSeverity.MEDIUM:
        return "border-l-4 border-l-amber-500";
      case IssueSeverity.LOW:
        return "border-l-4 border-l-slate-400";
      default:
        return "";
    }
  };

  return (
    <div
      id={`issue-card-${issue.id}`}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden text-left ${
        isFocused
          ? "border-indigo-500 shadow-lg shadow-indigo-50/50 ring-2 ring-indigo-500/20 scale-[1.01]"
          : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
      } ${getSeverityBorder(issue.severity)}`}
    >
      {/* Visual Header Grid */}
      <div className="flex flex-col sm:flex-row">
        {/* Issue Media Cover (Image or Video) */}
        {(issue.imageUrl || issue.videoUrl) && (
          <div className="w-full sm:w-44 h-44 sm:h-auto relative bg-slate-100 dark:bg-slate-950 shrink-0 overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100/60 dark:border-slate-850">
            {issue.videoUrl ? (
              <div className="w-full h-full relative group">
                <video
                  src={issue.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  muted
                  preload="metadata"
                />
                <span className="absolute bottom-2 right-2 bg-indigo-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Video
                </span>
              </div>
            ) : (
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            )}
            {/* Overlay tag for categories */}
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {issue.category}
              </span>
            </div>
          </div>
        )}

        {/* Content body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Badges & Status row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex gap-2 items-center flex-wrap">
                <BadgeIcon type="status" value={issue.status} size="sm" />
                <BadgeIcon type="severity" value={issue.severity} size="sm" />
                {issue.aiAssessed && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={10} className="fill-purple-300" />
                    AI Verified
                  </span>
                )}
              </div>
              
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                #{issue.id.slice(0, 8)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-slate-950 dark:text-slate-50 tracking-tight leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {issue.title}
            </h3>

            {/* Description */}
            <p className={`text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
              {issue.description}
            </p>

            {/* Predictive Foresight Insight */}
            {issue.predictiveInsight && (
              <div className="mt-3 p-3 bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1 mb-1">
                  <Sparkles size={10} />
                  AI Predictive Insight
                </p>
                <p className="text-[11px] italic text-slate-600 dark:text-slate-300 leading-relaxed">
                  {issue.predictiveInsight}
                </p>
              </div>
            )}

            {/* Address */}
            {issue.address && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-3 text-[11px] font-medium">
                <MapPin size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{issue.address}</span>
              </div>
            )}
          </div>

          {/* Card Footer / Actions Panel */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Reported Details */}
            <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <User size={10} />
                {issue.reportedBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(issue.reportedAt)}
              </span>
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center gap-2">
              {/* Focus on Map Button */}
              <button
                onClick={() => onFocusLocation(issue)}
                title="Locate on map"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                <MapPin size={14} />
              </button>

              {/* Share Button with relative dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareMenu(!showShareMenu);
                  }}
                  title="Share issue"
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                    showShareMenu
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500"
                  }`}
                >
                  <Share2 size={14} />
                </button>

                {showShareMenu && (
                  <>
                    {/* Backdrop to close the menu */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareMenu(false);
                      }}
                    />
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Share Civic Report
                        </span>
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} className="text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Civic Link</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleShareNextdoor}
                        className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={13} className="text-emerald-500" />
                        <span>Share on Nextdoor</span>
                      </button>
                      <button
                        onClick={handleShareTwitter}
                        className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer"
                      >
                        <Twitter size={13} className="text-sky-500 fill-sky-500/20" />
                        <span>Share on Twitter / X</span>
                      </button>
                      <button
                        onClick={handleEmailWard}
                        className="w-full px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 cursor-pointer"
                      >
                        <Mail size={13} className="text-purple-500" />
                        <span>Email Ward Councilor</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Upvote Button with +5 score floating bubble */}
              <button
                onClick={handleUpvoteClick}
                disabled={issue.hasUpvoted}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  issue.hasUpvoted
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300"
                }`}
              >
                <ThumbsUp size={12} className={issue.hasUpvoted ? "fill-emerald-600" : ""} />
                <span>{issue.upvotes}</span>
                
                {/* Floating score indicator */}
                {showPointsBubble === "upvote" && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[10px] py-0.5 px-1.5 rounded-full animate-bounce-subtle shadow-md">
                    +5 XP
                  </span>
                )}
              </button>

              {/* Verify Button with +20 score floating bubble */}
              {issue.status === IssueStatus.REPORTED && (
                <button
                  onClick={handleVerifyClick}
                  disabled={issue.hasVerified}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    issue.hasVerified
                      ? "bg-blue-50 text-blue-600 border-blue-200 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-xs shadow-indigo-100"
                  }`}
                >
                  <CheckSquare size={12} className={issue.hasVerified ? "fill-blue-600" : ""} />
                  <span>{issue.hasVerified ? "Verified" : "Verify"}</span>

                  {/* Floating score indicator */}
                  {showPointsBubble === "verify" && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold text-[10px] py-0.5 px-1.5 rounded-full animate-bounce-subtle shadow-md">
                      +20 XP
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Toggle to show full Status Stepper & logs */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-5 bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <span className="font-semibold flex items-center gap-1.5">
          Progress Roadmap
          <span className={`w-2 h-2 rounded-full ${
            issue.status === IssueStatus.RESOLVED ? "bg-emerald-500" :
            issue.status === IssueStatus.IN_PROGRESS ? "bg-indigo-500" :
            issue.status === IssueStatus.VERIFIED ? "bg-blue-500" : "bg-amber-500"
          }`} />
        </span>
        <span className="flex items-center gap-1">
          {isExpanded ? "Hide Logs" : "View Complete Timeline"}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-5">
          {/* Volunteer / Matchmaking Block */}
          {issue.status !== IssueStatus.RESOLVED && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-100/40 dark:border-indigo-900/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                  <HeartHandshake size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Volunteering & Community Action
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Active Citizens volunteer to clean, inspect or repair minor neighborhood reports.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-300">
                    {issue.volunteerCount || 0} Citizens Committed
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    if (!issue.hasVolunteered) {
                      setShowPointsBubble("volunteer");
                      setTimeout(() => setShowPointsBubble(null), 1200);
                      onVolunteer(issue.id);
                    }
                  }}
                  disabled={issue.hasVolunteered}
                  className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    issue.hasVolunteered
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-100"
                  }`}
                >
                  <HeartHandshake size={13} className={issue.hasVolunteered ? "fill-emerald-700" : ""} />
                  <span>{issue.hasVolunteered ? "Volunteered! (+30 XP)" : "Volunteer Now (+30 XP)"}</span>
                </button>

                {showPointsBubble === "volunteer" && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] py-0.5 px-1.5 rounded-full animate-bounce shadow-md z-20">
                    +30 XP
                  </span>
                )}
              </div>
            </div>
          )}

          <StatusStepper currentStatus={issue.status} history={issue.statusHistory} />

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4" />

          {/* Discussion Thread */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare size={13} className="text-indigo-500" />
                Community Discussion ({issue.comments?.length || 0})
              </h4>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                +10 XP per Comment
              </span>
            </div>

            {/* List of comments */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <img
                      src={comment.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                      alt={comment.author}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-750 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1">
                          {comment.author}
                          {comment.author === "Diana Prince" && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-1 py-0.5 rounded font-bold uppercase tracking-wide">
                              You
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(comment.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                            ? "Today at " + new Date(comment.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                            : new Date(comment.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center border border-dashed border-slate-250/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-900/20">
                  <p className="text-[11px] text-slate-400 font-medium italic">
                    No comments yet. Start the conversation to organize community effort!
                  </p>
                </div>
              )}
            </div>

            {/* Comment Form input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2.5 items-end pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask a question or organize action..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                {commentPointsEarned && (
                  <span className="absolute -top-6 right-2 text-[10px] font-bold text-emerald-500 animate-bounce">
                    +10 XP Awarded!
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
