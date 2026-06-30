import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize the server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined. Server AI features will run in mock fallback mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json({ limit: "10mb" }));

  // 1. API Endpoint: AI-powered Issue Categorization & Assessment
  app.post("/api/gemini/assess-issue", async (req, res) => {
    const { title, description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required for AI assessment." });
    }

    // Fallback static analysis if API key is not configured
    if (!ai) {
      console.log("Using static mock fallback for issue assessment.");
      const descLower = description.toLowerCase();
      let category = "Road & Pavement";
      let severity = "Medium";
      let predictiveInsight = "Regular pavement expansion can exacerbate traffic lanes.";

      if (descLower.includes("light") || descLower.includes("lamp") || descLower.includes("dark")) {
        category = "Street Lighting";
        severity = "Medium";
        predictiveInsight = "Unlit public areas are historically linked to diminished pedestrian security perceptions.";
      } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("utility")) {
        category = "Water & Utilities";
        severity = "High";
        predictiveInsight = "Underground water migration can erode structural road bases, causing abrupt pothole formation.";
      } else if (descLower.includes("park") || descLower.includes("bench") || descLower.includes("tree")) {
        category = "Parks & Recreation";
        severity = "Low";
        predictiveInsight = "Parks recreation damages decrease civic satisfaction indexes and property aesthetics.";
      } else if (descLower.includes("graffiti") || descLower.includes("vandalism") || descLower.includes("spray")) {
        category = "Public Art & Graffiti";
        severity = "Low";
        predictiveInsight = "Swift clean-ups decrease recurring vandalism rates in public facades.";
      } else if (descLower.includes("trash") || descLower.includes("garbage") || descLower.includes("dump") || descLower.includes("waste")) {
        category = "Trash & Sanitation";
        severity = "Medium";
        predictiveInsight = "Stagnant trash accumulations invite local pests and impact stormwater runoff sanitation.";
      }

      return res.json({
        category,
        severity,
        refinedTitle: title || "Reported Civic Hazard",
        refinedDescription: description,
        predictiveInsight,
        isFallback: true
      });
    }

    try {
      const prompt = `Analyze this citizen reported civic hazard issue and categorize/assess it.
Title reported: ${title || "N/A"}
Description reported: ${description}

Classify into one of these exact categories: "Road & Pavement", "Street Lighting", "Water & Utilities", "Parks & Recreation", "Public Art & Graffiti", "Trash & Sanitation".
Recommend a severity level from: "Low", "Medium", "High", "Critical".
Generate a professional, clean Title (refinedTitle) and write a polished and respectful Description (refinedDescription) of the issue.
Also output a Predictive Insight (predictiveInsight) detailing potential future failures, secondary impacts (e.g. soil erosion for water leaks, safety anomalies for unlit streetlamps), or optimization tips for the city planning board.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Road & Pavement', 'Street Lighting', 'Water & Utilities', 'Parks & Recreation', 'Public Art & Graffiti', 'Trash & Sanitation'."
              },
              severity: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Low', 'Medium', 'High', 'Critical'."
              },
              refinedTitle: {
                type: Type.STRING,
                description: "A highly concise, formal and descriptive title summarizing the civic concern."
              },
              refinedDescription: {
                type: Type.STRING,
                description: "A polished, structured, grammatically correct and constructive version of the citizen's report description."
              },
              predictiveInsight: {
                type: Type.STRING,
                description: "A 1-2 sentence engineering and urban planning predictive foresight describing downstream risks or anomalies."
              }
            },
            required: ["category", "severity", "refinedTitle", "refinedDescription", "predictiveInsight"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      return res.json({ ...result, isFallback: false });
    } catch (error: any) {
      console.error("Gemini assess-issue API error:", error);
      return res.status(500).json({ error: "Failed to perform AI analysis. " + error.message });
    }
  });

  // 2. API Endpoint: Impact & Predictive Dashboard Insights
  app.post("/api/gemini/generate-insights", async (req, res) => {
    const { issues } = req.body;

    if (!issues || !Array.isArray(issues)) {
      return res.status(400).json({ error: "Issues array is required." });
    }

    if (!ai) {
      console.log("Using static fallback for predictive dashboard.");
      return res.json({
        neighborhoodRiskLevel: "Moderate",
        safetyIndexScore: 78,
        predictiveSummary: "The overall neighborhood structural status is moderate. Main pipeline concerns on NW Lovejoy St pose sub-surface soil erosion hazards. Isolated streetlight outages on SW Morrison St reduce night visibility. Overall resolved rates are holding at 20%, requiring active community engagement.",
        hotspots: ["NW Lovejoy St Utilities Corridor", "Downtown pedestrian sectors"],
        recommendations: [
          {
            task: "Coordinate water saturation probe near NW Lovejoy supermarket",
            audience: "City Crew",
            impact: "Averting structural pavement collapse and saving water utilities resources (+50 Credits)."
          },
          {
            task: "Pedestrian safety night watch and lighting audit on SW Morrison",
            audience: "Neighborhood Watch",
            impact: "Increasing safe light coverage and mapping surrounding dark sectors (+30 Credits)."
          },
          {
            task: "Weekly volunteer trash sweep and storm drain clearing",
            audience: "Volunteers",
            impact: "Reduces seasonal flooding hazards and elevates street cleanliness scores (+40 Credits)."
          }
        ],
        isFallback: true
      });
    }

    try {
      const summaryString = issues.map((issue: any) => 
        `- [${issue.category}] Title: "${issue.title}" | Status: ${issue.status} | Severity: ${issue.severity} | Location: (${issue.location.lat}, ${issue.location.lng})`
      ).join("\n");

      const prompt = `You are a municipal city planning AI specializing in smart city infrastructure analytics and community impact reports.
Analyze these reported active issues in the Portland neighborhood sector and synthesize predictive health recommendations and indexes:

Active issues list:
${summaryString}

Provide an overall analysis consisting of:
1. neighborhoodRiskLevel: An intuitive risk rating ("Low", "Moderate", "High", "Critical").
2. safetyIndexScore: A numeric health score from 0 to 100 where higher is safer. (Calculate based on unresolved high/critical severity items, water main bursts, and dark unlit areas).
3. predictiveSummary: A 3-4 sentence comprehensive planning brief explaining the cross-impact of these issues (e.g. water leaks softening tarmac leading to future potholes, unlit lamps combined with broken park infrastructure causing pedestrian path safety risks).
4. hotspots: List the 1 or 2 sectors or intersections that show highest vulnerability.
5. recommendations: Provide exactly 3 proactive preventative preventative tasks for 'City Crew', 'Neighborhood Watch', or 'Volunteers' with their estimated impact.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              neighborhoodRiskLevel: {
                type: Type.STRING,
                description: "Must be 'Low', 'Moderate', 'High', or 'Critical'."
              },
              safetyIndexScore: {
                type: Type.INTEGER,
                description: "Civic infrastructure safety score from 0 to 100."
              },
              predictiveSummary: {
                type: Type.STRING,
                description: "3-4 sentence analytical summary of potential infrastructure failures and community status."
              },
              hotspots: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Vulnerable blocks, sectors or streets."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING, description: "Description of the preventative civic action." },
                    audience: { type: Type.STRING, description: "Target group: 'Volunteers', 'City Crew', or 'Neighborhood Watch'." },
                    impact: { type: Type.STRING, description: "Urban planning impact explanation, highlighting volunteer credit points." }
                  },
                  required: ["task", "audience", "impact"]
                },
                description: "Exactly 3 preventative recommendations."
              }
            },
            required: ["neighborhoodRiskLevel", "safetyIndexScore", "predictiveSummary", "hotspots", "recommendations"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      return res.json({ ...result, isFallback: false });
    } catch (error: any) {
      console.error("Gemini generate-insights API error:", error);
      return res.status(500).json({ error: "Failed to compile predictive dashboard. " + error.message });
    }
  });

  // 3. API Endpoint: NagrikSathi Chatbot Assistant
  app.post("/api/gemini/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Fallback static responder if API key is not configured
    if (!ai) {
      console.log("Using static mock fallback for NagrikSathi Chatbot.");
      const lastUserMsg = messages[messages.length - 1].text || "";
      const query = lastUserMsg.toLowerCase();
      let reply = "Hello citizen! I am NagrikSathi, your civic helper. I can help you report issues, find out about our wards, and check your rank. (Running in offline demo mode since GEMINI_API_KEY is not defined).";

      if (query.includes("point") || query.includes("xp") || query.includes("rank") || query.includes("reward")) {
        reply = "In our ward system, you earn points for active citizenship: \n- Reporting a new issue: +10 XP\n- Upvoting/confirming an issue: +15 XP\n- Resolving/verifying status changes: +30 XP\nYou can level up from Bronze Civic Scout to Silver Ward Warden, and eventually Gold Municipal Champion. Check the 'Profile' tab to see your progress!";
      } else if (query.includes("report") || query.includes("how to") || query.includes("submit")) {
        reply = "To submit a report, go to the 'Map' tab and click on any coordinates! Or use the '+ Report Custom Coords' button to write title & details. Don't forget to click 'AI Analyze & Categorize' to let me refine your report and generate predictive planning insights!";
      } else if (query.includes("pothole") || query.includes("road") || query.includes("damage")) {
        reply = "Road and pavement damages are very common. If you notice a deep pothole, please take a picture and drop a tag on the Map tab under 'Road & Pavement'. Once other ward citizens verify it, the municipal crew or active volunteers can align resources to patch it up.";
      } else if (query.includes("light") || query.includes("dark") || query.includes("streetlight")) {
        reply = "Streetlight outages reduce night visibility and pedestrian safety. Report lighting issues under 'Street Lighting'. Volunteers can coordinate with neighborhood watches to run night audits and restore comfort levels.";
      } else if (query.includes("volunteer") || query.includes("help") || query.includes("crew")) {
        reply = "You can volunteer for any active issue by navigating to the 'Complaints' or 'Home' feed, opening the issue details, and clicking 'Volunteer to Assist'. If you're a city worker, you can use the Action Simulator to dispatch crews or mark repairs as completed!";
      }

      return res.json({
        reply,
        isFallback: true
      });
    }

    try {
      // Map simple message structure to Gemini SDK Chat History
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const lastMsgText = messages[messages.length - 1].text;

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are "NagrikSathi", a friendly, warm, empathetic, and highly competent AI civic assistant on the "FixItforWard" platform. 
Your goal is to guide citizens, answer municipal questions, clarify the platform's XP rewards system, and assist them in improving their local neighborhood ward in Portland, Oregon.

Keep your answers concise, engaging, and action-oriented. Suggest actions the user can take on our platform:
1. In "Home", they can view and filter issues.
2. In "Map", they can click coordinates to file geo-tagged reports.
3. In "Leaderboard", they can see rankings.
4. In "Complaints", they can track progress, volunteer, and use the simulation controls to transition statuses (Verified -> In Progress -> Resolved).
5. In "Profile", they track XP and level up:
   - File issue: +10 XP
   - Upvote: +15 XP
   - Administration/Verify resolution: +30 XP

Be extremely polite, encouraging, and represent the ideal digital civic buddy. Avoid heavy formatting but use neat bullet points if describing instructions.`
        },
        history: history
      });

      const response = await chat.sendMessage({ message: lastMsgText });
      const reply = response.text || "I apologize, but I couldn't generate a response. How else may I assist you with FixItforWard?";

      return res.json({
        reply,
        isFallback: false
      });
    } catch (error: any) {
      console.error("NagrikSathi Chatbot API error:", error);
      return res.status(500).json({ error: "Failed to communicate with NagrikSathi. " + error.message });
    }
  });

  // Serve Vite assets in production, otherwise mount the Vite server middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack FixItforWard server running on http://localhost:${PORT}`);
  });
}

startServer();
