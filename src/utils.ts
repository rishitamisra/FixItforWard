/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserStats } from "./types";

export interface RankInfo {
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
  quote: string;
}

export const RANKS_LADDER: RankInfo[] = [
  {
    name: "Civic Novice",
    minPoints: 0,
    maxPoints: 29,
    description: "Welcome to the squad! Get started by upvoting verified local issues and tagging hazardous spots.",
    quote: "Every epic journey begins with a single report."
  },
  {
    name: "Neighborhood Watcher",
    minPoints: 30,
    maxPoints: 74,
    description: "You have a keen eye for detail. Your contributions are starting to make streets safer and cleaner.",
    quote: "A watcher sees what others walk past."
  },
  {
    name: "Active Citizen",
    minPoints: 75,
    maxPoints: 149,
    description: "A respected peer in the community! You verify reports rapidly and advocate for neighborhood beautification.",
    quote: "Citizens do not just live in a city; they shape it."
  },
  {
    name: "Local Guardian",
    minPoints: 150,
    maxPoints: 299,
    description: "An indispensable helper of the municipality. You work hand-in-hand with civic workers to coordinate solutions.",
    quote: "Protecting our streets, greenways, and public spaces."
  },
  {
    name: "Community Hero",
    minPoints: 300,
    maxPoints: 999999,
    description: "Legendary status! The town runs smoother, safer, and happier because of your relentless dedication.",
    quote: "Not all heroes wear capes—some report potholes!"
  }
];

/**
 * Calculates the current rank name based on accumulated points.
 */
export function calculateRank(points: number): string {
  const rank = RANKS_LADDER.find(r => points >= r.minPoints && points <= r.maxPoints);
  return rank ? rank.name : "Civic Novice";
}

/**
 * Gets detailed rank threshold, description, and next-level target.
 */
export function getRankDetails(points: number) {
  const currentRankIndex = RANKS_LADDER.findIndex(r => points >= r.minPoints && points <= r.maxPoints);
  const current = RANKS_LADDER[currentRankIndex] || RANKS_LADDER[0];
  const next = RANKS_LADDER[currentRankIndex + 1] || null;

  const progress = next 
    ? ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100 
    : 100;

  return {
    current,
    next,
    progress: Math.min(100, Math.max(0, progress)),
    pointsNeeded: next ? next.minPoints - points : 0
  };
}
