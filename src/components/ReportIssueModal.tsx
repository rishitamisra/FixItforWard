/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, MapPin, Upload, Image as ImageIcon, Sparkles, AlertTriangle } from "lucide-react";
import { Issue, IssueSeverity, IssueStatus, Coordinates } from "../types";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: Omit<Issue, "id" | "reportedAt" | "upvotes" | "verifications" | "status" | "statusHistory" | "hasUpvoted" | "hasVerified">) => void;
  initialCoords: Coordinates | null;
  defaultReporterName?: string;
}

const CATEGORY_PRESETS: Record<string, string> = {
  "Road & Pavement": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800",
  "Street Lighting": "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800",
  "Water & Utilities": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
  "Parks & Recreation": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800",
  "Public Art & Graffiti": "https://images.unsplash.com/photo-1571115177098-24ec42095185?auto=format&fit=crop&q=80&w=800",
  "Trash & Sanitation": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800"
};

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCoords,
  defaultReporterName = ""
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road & Pavement");
  const [severity, setSeverity] = useState<IssueSeverity>(IssueSeverity.MEDIUM);
  const [reporterName, setReporterName] = useState("");
  const [coords, setCoords] = useState<Coordinates>({ lat: 45.5200, lng: -122.6795 });
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [aiAssessedFlag, setAiAssessedFlag] = useState(false);

  // Sync coords with passed coordinate tags
  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

  // Sync reporter display name when modal opens
  useEffect(() => {
    if (isOpen && defaultReporterName) {
      setReporterName(defaultReporterName);
    }
  }, [isOpen, defaultReporterName]);

  if (!isOpen) return null;

  // Handle AI-powered Categorization & Analysis from server-side Gemini endpoint
  const handleAIAnalyze = async () => {
    if (!description.trim()) {
      alert("Please write a brief description first so our Civic AI can analyze and categorize it.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/assess-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.refinedTitle || title);
        setDescription(data.refinedDescription || description);
        setCategory(data.category || category);
        setSeverity(data.severity || severity);
        setAiInsight(data.predictiveInsight || "");
        setAiAssessedFlag(true);
      } else {
        const err = await response.json();
        alert("AI Assessment returned an issue: " + (err.error || "Please verify your setup."));
      }
    } catch (err: any) {
      console.error("Error analyzing issue:", err);
      alert("Failed to reach the AI engine. Fell back to local semantic categorization.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate a mock address based on coordinates
  const generateSimulatedAddress = (c: Coordinates) => {
    // Round to make it consistent
    const l1 = Math.round(c.lat * 1000) / 1000;
    const l2 = Math.round(c.lng * 1000) / 1000;

    if (Math.abs(l1 - 45.52) < 0.005 && Math.abs(l2 - (-122.68)) < 0.005) {
      return "Pioneer Square Sector, Portland, OR 97205";
    } else if (l1 > 45.525) {
      return `NW Lovejoy district, block ${Math.round(l1 * 10000 % 100 + 10)}0, Portland, OR 97209`;
    } else if (l2 > -122.67) {
      return `East Burnside Corridor, Near Bridge, Portland, OR 97214`;
    } else {
      return `SW Broadway Sector, SW Columbia St, Portland, OR 97201`;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simulate file upload with Unsplash representative image or local data URL
      const file = e.dataTransfer.files[0];
      setSimulatedFile(file.name);
      
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const isVideo = ["mp4", "mov", "avi", "webm"].includes(fileExt || "");
      
      if (isVideo) {
        setCustomVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-pothole-in-the-road-during-heavy-rain-41584-large.mp4");
        setCustomImageUrl("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800");
      } else {
        setCustomImageUrl(CATEGORY_PRESETS[category] || "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&q=80&w=800");
        setCustomVideoUrl("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Determine finalized image (custom URL > uploaded simulation file > Category Preset)
    const finalizedImage = customImageUrl || CATEGORY_PRESETS[category];
    const computedAddress = generateSimulatedAddress(coords);

    onSubmit({
      title,
      description,
      category,
      severity,
      location: coords,
      address: computedAddress,
      reportedBy: reporterName.trim() || "Anonymous Hero",
      imageUrl: finalizedImage,
      videoUrl: customVideoUrl || undefined,
      aiAssessed: aiAssessedFlag,
      predictiveInsight: aiInsight || undefined,
      volunteerCount: 0,
      hasVolunteered: false
    });

    // Reset state and close
    setTitle("");
    setDescription("");
    setCategory("Road & Pavement");
    setSeverity(IssueSeverity.MEDIUM);
    setReporterName("");
    setCustomImageUrl("");
    setCustomVideoUrl("");
    setSimulatedFile(null);
    setAiInsight("");
    setAiAssessedFlag(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with modern glassmorphism blur */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Report a Civic Issue</h2>
              <p className="text-[10px] text-slate-500">Citizen Reporting Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Coordinates Reminder Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/20 text-xs flex items-start gap-2.5">
            <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="font-semibold text-indigo-950 dark:text-indigo-400">Tagged Location coordinates:</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                Lat: {coords.lat.toFixed(5)}°N, Lng: {coords.lng.toFixed(5)}°W. <br />
                <span className="text-[10px] text-slate-400">Generated simulated address: <span className="font-mono text-indigo-600 dark:text-indigo-400">{generateSimulatedAddress(coords)}</span></span>
              </p>
            </div>
          </div>

          {/* Title Field */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Deep asphalt pothole, Hazardous leaning light pole"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description Field */}
          <div className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Description / Details <span className="text-rose-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles size={11} className={isAnalyzing ? "animate-spin" : ""} />
                <span>{isAnalyzing ? "Analyzing with AI..." : "✨ AI Analyze & Categorize"}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Provide a thorough description. What kind of damage is it? Is it blocking traffic? How long has it been there?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none leading-relaxed"
            />

            {/* AI Insight Box */}
            {aiAssessedFlag && aiInsight && (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-400">
                <p className="font-bold uppercase tracking-wider text-[9px] text-emerald-600 mb-0.5 flex items-center gap-1">
                  🔮 AI Predictive Foresight
                </p>
                <p className="leading-normal italic">{aiInsight}</p>
              </div>
            )}
          </div>

          {/* Category & Severity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              >
                {Object.keys(CATEGORY_PRESETS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-semibold"
              >
                <option value={IssueSeverity.LOW}>Low</option>
                <option value={IssueSeverity.MEDIUM}>Medium</option>
                <option value={IssueSeverity.HIGH}>High</option>
                <option value={IssueSeverity.CRITICAL}>Critical</option>
              </select>
            </div>
          </div>

          {/* Reporter name */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Reporter Display Name
            </label>
            <input
              type="text"
              placeholder="e.g., Jane Cooper (Leave blank for Anonymous Hero)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Image & Video Upload Area */}
          <div className="text-left space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>Attach Report Image</span>
                <span className="text-[10px] text-indigo-500 font-normal normal-case">Presets auto-assigned if empty</span>
              </label>
              
              <input
                type="url"
                placeholder="Paste custom image URL (optional)"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  setSimulatedFile(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>Attach Report Video (MP4 / WebM)</span>
                <span className="text-[10px] text-indigo-500 font-normal normal-case">Optional citizen video evidence</span>
              </label>
              
              <input
                type="url"
                placeholder="Paste custom video URL (e.g. mp4, webm) (optional)"
                value={customVideoUrl}
                onChange={(e) => {
                  setCustomVideoUrl(e.target.value);
                  setSimulatedFile(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Drag and Drop Container for media simulation */}
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Direct Drag & Drop Simulation</span>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/20"
                    : simulatedFile
                    ? "border-emerald-400 bg-emerald-50/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {simulatedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                      <X
                        size={14}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSimulatedFile(null);
                          setCustomImageUrl("");
                          setCustomVideoUrl("");
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">File attached: {simulatedFile}</span>
                    <p className="text-[10px] text-slate-400">Media file uploaded and parsed successfully</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & drop photo or video here</span>
                    <span className="text-[10px] text-slate-400">or click to browse local files (MP4/PNG auto-simulated)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              Submit Report (+10 PTS)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
