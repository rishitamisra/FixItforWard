/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum IssueStatus {
  REPORTED = "Reported",
  VERIFIED = "Verified",
  IN_PROGRESS = "In-Progress",
  RESOLVED = "Resolved"
}

export enum IssueSeverity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StatusHistoryEntry {
  status: IssueStatus;
  timestamp: string;
  note?: string;
}

export interface IssueComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: IssueSeverity;
  status: IssueStatus;
  location: Coordinates;
  address?: string;
  reportedBy: string;
  reportedAt: string;
  upvotes: number;
  verifications: number;
  imageUrl?: string;
  videoUrl?: string;
  statusHistory: StatusHistoryEntry[];
  hasUpvoted?: boolean;
  hasVerified?: boolean;
  aiAssessed?: boolean;
  predictiveInsight?: string;
  volunteerCount?: number;
  hasVolunteered?: boolean;
  comments?: IssueComment[];
}

export interface UserStats {
  points: number;
  reportsCount: number;
  upvotesCount: number;
  verificationsCount: number;
  rank: string;
}
