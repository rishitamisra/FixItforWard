/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Compass, AlertTriangle, Info, Plus, Sparkles, Check } from "lucide-react";
import { Issue, IssueStatus, Coordinates } from "../types";

interface NeighborhoodMapProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  onMapClickCoords: (coords: Coordinates) => void;
  activeCoords: Coordinates | null;
}

// Coordinate bounding box for Portland (Central Area)
const BOUNDS = {
  north: 45.5340,
  south: 45.5130,
  west: -122.6920,
  east: -122.6520
};

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClickCoords,
  activeCoords
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [tempMarker, setTempMarker] = useState<Coordinates | null>(null);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);

  // Sync tempMarker with activeCoords passed from parent
  useEffect(() => {
    if (activeCoords) {
      setTempMarker(activeCoords);
    } else {
      setTempMarker(null);
    }
  }, [activeCoords]);

  // Convert GPS Coordinates to percentage (X, Y) for SVG plotting
  const getCoordinatesPct = (coords: Coordinates) => {
    const lngSpan = BOUNDS.east - BOUNDS.west;
    const latSpan = BOUNDS.north - BOUNDS.south;

    let x = ((coords.lng - BOUNDS.west) / lngSpan) * 100;
    let y = (1 - (coords.lat - BOUNDS.south) / latSpan) * 100;

    // Clamp values between 2% and 98% so pins do not overflow borders
    x = Math.max(2, Math.min(98, x));
    y = Math.max(2, Math.min(98, y));

    return { x, y };
  };

  // Convert clicks on the map element to GPS coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    // Avoid triggering map click when clicking pins or popups
    const target = e.target as HTMLElement;
    if (target.closest(".map-marker") || target.closest(".map-popup")) {
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    const lngSpan = BOUNDS.east - BOUNDS.west;
    const latSpan = BOUNDS.north - BOUNDS.south;

    // Inverse calculations
    const lng = BOUNDS.west + pctX * lngSpan;
    const lat = BOUNDS.south + (1 - pctY) * latSpan;

    const roundedCoords = {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000
    };

    setTempMarker(roundedCoords);
    onMapClickCoords(roundedCoords);
    setGeoError(null);
  };

  // Trigger browser's Geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        
        // Let's check if user's real location is way outside Portland.
        // If it is, let's map them inside Portland for visual playability, 
        // but store their real coordinates!
        let simCoords = { lat: latitude, lng: longitude };
        
        const isOutside = 
          latitude < BOUNDS.south || 
          latitude > BOUNDS.north || 
          longitude < BOUNDS.west || 
          longitude > BOUNDS.east;

        if (isOutside) {
          // Put them at a random spot inside Pioneer Courthouse Square with subtle offset
          simCoords = {
            lat: 45.5200 + (Math.random() - 0.5) * 0.005,
            lng: -122.6795 + (Math.random() - 0.5) * 0.005
          };
          setGeoError("Note: Your physical coordinates are outside Portland bounds. Placed a simulated pin within active civic sector!");
        }

        setTempMarker(simCoords);
        onMapClickCoords(simCoords);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied. Click on map directly to tag a report.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location details unavailable. Click on map directly.");
            break;
          case error.TIMEOUT:
            setGeoError("Location request timed out. Try clicking map.");
            break;
          default:
            setGeoError("Could not retrieve geolocation.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getPinColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED:
        return "bg-emerald-500 ring-emerald-200 text-emerald-500";
      case IssueStatus.IN_PROGRESS:
        return "bg-indigo-500 ring-indigo-200 text-indigo-500";
      case IssueStatus.VERIFIED:
        return "bg-blue-500 ring-blue-200 text-blue-500";
      default:
        return "bg-amber-500 ring-amber-200 text-amber-500";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Compass className="animate-spin-slow" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">Active Sector Map</h3>
            <p className="text-[10px] text-slate-400 font-mono">Portland Grid System — EPSG:4326</p>
          </div>
        </div>

        {/* Locate me trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 text-xs font-semibold shadow-md transition-all text-white cursor-pointer"
          >
            <Navigation size={12} className={isLocating ? "animate-pulse" : ""} />
            {isLocating ? "Locating..." : "Use My Location"}
          </button>
        </div>
      </div>

      {/* Interactive Map Layout Canvas */}
      <div
        id="civic-grid-map"
        ref={mapRef}
        onClick={handleMapClick}
        className="flex-1 min-h-[380px] relative bg-slate-950 overflow-hidden cursor-crosshair select-none group"
      >
        {/* SVG background vectors: Grid lines, rivers, roads, parks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Willamette River Vector (curved blue path running top to bottom, slightly to the right) */}
          <path
            d="M 600,0 Q 580,200 520,300 T 480,600"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="80"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d="M 600,0 Q 580,200 520,300 T 480,600"
            fill="none"
            stroke="#2563eb"
            strokeWidth="10"
            strokeLinecap="round"
            className="opacity-20"
          />

          {/* Bridges crossing the river */}
          {/* Broadway Bridge (Top) */}
          <line x1="480" y1="120" x2="570" y2="120" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          {/* Steel Bridge */}
          <line x1="475" y1="210" x2="555" y2="210" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          {/* Burnside Bridge (Middle) */}
          <line x1="460" y1="310" x2="540" y2="310" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          {/* Hawthorne Bridge (Bottom) */}
          <line x1="450" y1="460" x2="520" y2="460" stroke="#475569" strokeWidth="6" strokeLinecap="round" />

          {/* Major Roads Grid */}
          {/* E Burnside (east-west) */}
          <line x1="0" y1="310" x2="1000" y2="310" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* SW Broadway (diagonal) */}
          <line x1="200" y1="600" x2="120" y2="0" stroke="#334155" strokeWidth="3" />
          {/* NW Lovejoy St */}
          <line x1="0" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="2" />
          {/* SW Morrison St */}
          <line x1="0" y1="260" x2="460" y2="260" stroke="#334155" strokeWidth="1.5" />

          {/* Parks Areas */}
          {/* Waterfront Park */}
          <path d="M 445,200 L 460,300 L 440,450 L 410,440 L 420,280 Z" fill="#064e3b" className="opacity-30" />
          {/* Pioneer Square (SW 6th & Morrison) */}
          <rect x="235" y="240" width="30" height="30" rx="3" fill="#3b0712" className="opacity-45" />
          <rect x="235" y="240" width="30" height="30" rx="3" fill="none" stroke="#ef4444" strokeWidth="1" className="opacity-25" />
        </svg>

        {/* River Label */}
        <span className="absolute top-1/2 right-[12%] text-[9px] uppercase font-bold tracking-widest text-slate-700 select-none">
          Willamette River
        </span>

        {/* Waterfront Park Label */}
        <span className="absolute bottom-[28%] left-[41%] text-[8px] uppercase font-bold tracking-wider text-emerald-700/80 select-none">
          Waterfront Park
        </span>

        {/* Pioneer Square Label */}
        <span className="absolute top-[36%] left-[17%] text-[8px] uppercase font-bold tracking-wider text-red-500/60 select-none">
          Pioneer Square
        </span>

        {/* Plotted Issue Pins */}
        {issues.map((issue) => {
          const { x, y } = getCoordinatesPct(issue.location);
          const isSelected = selectedIssueId === issue.id;
          const markerColor = getPinColor(issue.status);

          return (
            <div
              key={issue.id}
              className="map-marker absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIssue(issue.id);
              }}
              onMouseEnter={() => setHoveredIssue(issue)}
              onMouseLeave={() => setHoveredIssue(null)}
            >
              {/* Outer pulsing circle ring */}
              <div
                className={`absolute inset-0 rounded-full w-8 h-8 -left-2 -top-2 animate-ping opacity-25 ${
                  isSelected ? "bg-indigo-400 scale-125" : "bg-slate-400"
                }`}
              />

              {/* Pin Container */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border shadow-xl transition-all duration-300 ${
                  isSelected
                    ? "bg-indigo-600 border-white scale-125 ring-4 ring-indigo-500/20"
                    : `${markerColor} border-slate-900 hover:scale-110 hover:ring-2 hover:ring-white`
                }`}
              >
                {issue.status === IssueStatus.RESOLVED ? (
                  <Check size={10} className="text-white" strokeWidth={3} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          );
        })}

        {/* Temporary placement marker for reporting */}
        {tempMarker && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full z-30"
            style={{
              left: `${getCoordinatesPct(tempMarker).x}%`,
              top: `${getCoordinatesPct(tempMarker).y}%`
            }}
          >
            {/* Glowing pulse rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-indigo-500/60 animate-ping opacity-35" />
            
            {/* The Pointer Pin */}
            <div className="flex flex-col items-center animate-bounce-subtle">
              <div className="bg-indigo-500 text-white font-bold text-[10px] px-2 py-1 rounded-md shadow-lg flex items-center gap-1 border border-indigo-400 whitespace-nowrap">
                <Sparkles size={10} />
                <span>Tag Issue</span>
              </div>
              <div className="w-0.5 h-2 bg-indigo-500" />
              <MapPin size={24} className="text-indigo-500 fill-indigo-500 -mt-1 drop-shadow-md" />
            </div>
          </div>
        )}

        {/* Live Hover Tooltip Popover */}
        {hoveredIssue && (
          <div
            className="map-popup absolute bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-2xl pointer-events-none z-40 w-48 text-left transition-all duration-150"
            style={{
              left: `${getCoordinatesPct(hoveredIssue.location).x}%`,
              top: `${getCoordinatesPct(hoveredIssue.location).y - 8}%`,
              transform: "translate(-50%, -100%)"
            }}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                {hoveredIssue.category}
              </span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                hoveredIssue.status === IssueStatus.RESOLVED ? "bg-emerald-500/20 text-emerald-400" :
                hoveredIssue.status === IssueStatus.IN_PROGRESS ? "bg-indigo-500/20 text-indigo-400" :
                "bg-amber-500/20 text-amber-400"
              }`}>
                {hoveredIssue.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{hoveredIssue.title}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{hoveredIssue.address}</p>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-slate-500">
              <span>👍 {hoveredIssue.upvotes} Upvotes</span>
              <span>•</span>
              <span>{hoveredIssue.severity} Severity</span>
            </div>
          </div>
        )}

        {/* Click Instruction Label overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 flex items-center gap-2 pointer-events-none">
          <Info size={12} className="text-indigo-400 shrink-0" />
          <span>Click anywhere to select coordinates, or drag and zoom.</span>
        </div>
      </div>

      {/* Map Footer Metadata & Quick Action Overlay */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-left">
          {tempMarker ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Tagged Location coordinates:</span>
              <span className="text-xs font-mono text-slate-200 mt-0.5">
                Latitude: {tempMarker.lat.toFixed(4)}°N, Longitude: {tempMarker.lng.toFixed(4)}°W
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <AlertTriangle size={12} className="text-amber-500" />
              <span>No coordinates tagged. Click the map or locate yourself.</span>
            </div>
          )}
        </div>

        {tempMarker && (
          <button
            onClick={() => onMapClickCoords(tempMarker)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-indigo-900/30 text-white cursor-pointer"
          >
            <Plus size={12} />
            Report Issue Here
          </button>
        )}
      </div>

      {/* Geolocation feedback alert toast bar */}
      {geoError && (
        <div className="absolute top-16 left-4 right-4 bg-slate-900/95 border border-amber-900/40 text-amber-300 p-3 rounded-xl shadow-xl z-50 text-xs flex items-center justify-between gap-2 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-left">
            <Info size={14} className="text-amber-400 shrink-0" />
            <p>{geoError}</p>
          </div>
          <button
            onClick={() => setGeoError(null)}
            className="text-[10px] font-bold bg-amber-950/40 hover:bg-amber-950 text-amber-200 px-2 py-1 rounded-md"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
