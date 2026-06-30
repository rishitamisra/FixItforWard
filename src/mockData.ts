/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Issue, IssueStatus, IssueSeverity } from "./types";

export const MOCK_ISSUES: Issue[] = [
  {
    id: "issue-1",
    title: "Deep Pothole on SW Broadway",
    description: "A hazardous pothole has formed in the middle lane of SW Broadway, right before the crossing. It's about 6 inches deep and can easily damage wheel rims or cause cyclists to lose balance. Multiple cars have been swerving to avoid it.",
    category: "Road & Pavement",
    severity: IssueSeverity.HIGH,
    status: IssueStatus.REPORTED,
    location: { lat: 45.5186, lng: -122.6812 },
    address: "710 SW Broadway, Portland, OR 97205",
    reportedBy: "Alex Chen",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    upvotes: 14,
    verifications: 0,
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800",
    statusHistory: [
      {
        status: IssueStatus.REPORTED,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        note: "Issue reported by Alex Chen via GPS location tagging."
      }
    ],
    comments: [
      {
        id: "comment-1-1",
        author: "Marcus Brody",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "Nearly popped my front tire on this yesterday! Be extremely careful driving on SW Broadway at night.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "comment-1-2",
        author: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        text: "I reported it to the local ward community, hoping they fill it soon before we see a cycle accident.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "issue-2",
    title: "Streetlight Out near Pioneer Square",
    description: "The street lamp at the corner of SW Morrison and SW 6th Ave has been completely dark for over a week. At night, this corner becomes extremely dim and feels unsafe for pedestrians waiting for the MAX light rail.",
    category: "Street Lighting",
    severity: IssueSeverity.MEDIUM,
    status: IssueStatus.VERIFIED,
    location: { lat: 45.5200, lng: -122.6795 },
    address: "701 SW Morrison St, Portland, OR 97205",
    reportedBy: "Marcus Vance",
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    upvotes: 32,
    verifications: 4,
    imageUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=800",
    statusHistory: [
      {
        status: IssueStatus.REPORTED,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        note: "Reported via mobile web app."
      },
      {
        status: IssueStatus.VERIFIED,
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        note: "Verified by 4 verified local community contributors."
      }
    ],
    comments: [
      {
        id: "comment-2-1",
        author: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
        text: "Yes, it gets incredibly pitch black here. I've been walking with my phone flashlight on when catching the train.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "issue-3",
    title: "Water Main Leak on NW Lovejoy St",
    description: "Clean water is actively bubbling up through a seam in the asphalt in front of the supermarket. It is running down the gutter and creating a large puddle at the intersection. It appears to be an underground main failure.",
    category: "Water & Utilities",
    severity: IssueSeverity.CRITICAL,
    status: IssueStatus.IN_PROGRESS,
    location: { lat: 45.5301, lng: -122.6845 },
    address: "1350 NW Lovejoy St, Portland, OR 97209",
    reportedBy: "Sarah Jenkins",
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    upvotes: 45,
    verifications: 12,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
    statusHistory: [
      {
        status: IssueStatus.REPORTED,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        note: "Water gushing reported with photos."
      },
      {
        status: IssueStatus.VERIFIED,
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
        note: "Verified rapidly due to critical nature."
      },
      {
        status: IssueStatus.IN_PROGRESS,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        note: "City Water Bureau dispatched. Excavation crew en route."
      }
    ],
    comments: [
      {
        id: "comment-3-1",
        author: "David Miller",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
        text: "Saw the Water Bureau truck arrive. They've cordoned off the area. Looks like a big job.",
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "comment-3-2",
        author: "Chloe Dupont",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Thank goodness the city team responded so fast, millions of gallons of drinking water would be wasted otherwise.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "issue-4",
    title: "Broken Bench & Overgrown Bushes at Park",
    description: "One of the wooden public benches along the waterfront walking path has been broken, with several slats split and nails exposed. In addition, the decorative bushes are growing over the path forcing runners to step onto the grass.",
    category: "Parks & Recreation",
    severity: IssueSeverity.LOW,
    status: IssueStatus.IN_PROGRESS,
    location: { lat: 45.5175, lng: -122.6710 },
    address: "Tom McCall Waterfront Park, Portland, OR 97204",
    reportedBy: "David Miller",
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    upvotes: 9,
    verifications: 2,
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800",
    statusHistory: [
      {
        status: IssueStatus.REPORTED,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Reported. Image uploaded successfully."
      },
      {
        status: IssueStatus.VERIFIED,
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Verified by nearby runners."
      },
      {
        status: IssueStatus.IN_PROGRESS,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Assigned to Portland Parks Maintenance team."
      }
    ],
    comments: []
  },
  {
    id: "issue-5",
    title: "Graffiti on Historic Brick Wall",
    description: "Spray paint tags have been sprayed across the lower level brickwork of the historic building on E Burnside. Needs professional sandblasting or painting over to restore the masonry.",
    category: "Public Art & Graffiti",
    severity: IssueSeverity.LOW,
    status: IssueStatus.RESOLVED,
    location: { lat: 45.5230, lng: -122.6580 },
    address: "110 E Burnside St, Portland, OR 97214",
    reportedBy: "Chloe Dupont",
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    upvotes: 18,
    verifications: 5,
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42095185?auto=format&fit=crop&q=80&w=800",
    statusHistory: [
      {
        status: IssueStatus.REPORTED,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Vandalism reported on the building's facade."
      },
      {
        status: IssueStatus.VERIFIED,
        timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Verified by building management."
      },
      {
        status: IssueStatus.IN_PROGRESS,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Graffiti removal team scheduled with specialized equipment."
      },
      {
        status: IssueStatus.RESOLVED,
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Graffiti removed successfully using non-destructive water blasting. Facade is clean."
      }
    ],
    comments: [
      {
        id: "comment-5-1",
        author: "Chloe Dupont",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Just walked past it this morning and the facade looks pristine again! Good work, Portland graffiti cleanup crew!",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];
