import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// PWA Manifest and Service Worker with explicit CORS for PWABuilder and remote validators
app.get("/manifest.json", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  const candidates = [
    path.join(process.cwd(), "public", "manifest.json"),
    path.join(process.cwd(), "dist", "manifest.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  res.status(404).send("Manifest not found");
});

app.get("/sw.js", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const candidates = [
    path.join(process.cwd(), "public", "sw.js"),
    path.join(process.cwd(), "dist", "sw.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  res.status(404).send("Service worker not found");
});

// Direct Source Code ZIP download endpoint
app.get(["/tecxai-source-code.zip", "/download-source"], (req, res) => {
  const zipPath = path.join(process.cwd(), "public", "tecxai-source-code.zip");
  if (fs.existsSync(zipPath)) {
    res.setHeader("Content-Disposition", 'attachment; filename="tecxai-source-code.zip"');
    res.setHeader("Content-Type", "application/zip");
    return res.sendFile(zipPath);
  }
  res.status(404).send("Source code zip file not found");
});

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    company: "TECX Private Limited",
    app: "TECXAI",
    website: "https://www.tecx.ai",
    version: "1.0.0-update1",
    cloudAiAvailable: Boolean(process.env.GEMINI_API_KEY),
    localEngineAvailable: true,
  });
});

// Server-side cloud LLM Rubik's cube / puzzle solver
app.post("/api/ai/solve-cube", async (req, res) => {
  try {
    const { scrambleSequence, currentState, difficulty, solverMode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: true,
        source: "tecx-heuristic-engine",
        message: "Generated via TECX Rule-Based Algorithmic Engine (Cloud fallback)",
        steps: generateFallbackSolution(scrambleSequence),
      });
    }

    const prompt = `You are TECXAI Cube Solver Engine, developed by TECX Private Limited (https://www.tecx.ai).
The user scrambled a 3x3 Rubik's cube with this sequence of moves: "${scrambleSequence || 'R U R\' U\' F\' U F'}".
Explain and provide the solution steps in standard notation (U, U', D, D', L, L', R, R', F, F', B, B', U2, etc.).

Return a strict JSON object with:
{
  "summary": "Brief phase-by-phase summary",
  "method": "CFOP / Layer-by-Layer",
  "totalMoves": number,
  "phases": [
    {
      "phaseName": "e.g. White Cross",
      "explanation": "Why these moves work",
      "moves": ["R", "U", "R'"]
    }
  ],
  "fullMoveSequence": ["R", "U", "R'"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        source: "tecx-gemini-cloud",
        data: parsed,
      });
    } catch {
      return res.json({
        success: true,
        source: "tecx-heuristic-engine",
        steps: generateFallbackSolution(scrambleSequence),
        raw: text,
      });
    }
  } catch (error: any) {
    console.error("AI Solve error:", error);
    return res.json({
      success: true,
      source: "tecx-heuristic-engine-fallback",
      steps: generateFallbackSolution(req.body?.scrambleSequence),
      note: "Used fallback heuristic engine due to cloud provider timeout or limit.",
    });
  }
});

// Assistant route for TECX AI advice (phone battery customization, AI engine telemetry)
app.post("/api/ai/advisor", async (req, res) => {
  try {
    const { query, batteryStats, currentMode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `[TECX Local Engine]: For optimal lithium-ion battery longevity, keep charging bounded between ${batteryStats?.lowThreshold || 20}% and ${batteryStats?.highThreshold || 80}%. High temperatures above 35°C accelerate degradation. TECXAI loud audio alert is active to notify you immediately on reaching the ceiling threshold.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are the TECXAI Smart Android & Battery Systems Advisor by TECX Private Limited (website: https://www.tecx.ai).
Battery metrics: Level: ${batteryStats?.level}%, Is Charging: ${batteryStats?.charging}, High Alert: ${batteryStats?.highThreshold}%, Low Alert: ${batteryStats?.lowThreshold}%.
Current processing mode: ${currentMode}.
User question: "${query}".
Give a concise, highly practical answer (under 80 words) tailored to Android power management and smart device customization.`,
    });

    return res.json({ answer: response.text || "Battery parameters optimal." });
  } catch (err: any) {
    return res.json({
      answer: "TECX Local Optimizer: Monitor charge cycles and keep battery between 20% and 85% for maximum cycle lifespan.",
    });
  }
});

function generateFallbackSolution(scramble?: string) {
  if (!scramble) scramble = "R U R' U'";
  const moves = scramble.trim().split(/\s+/).filter(Boolean);
  // Inverse moves for standard unwinding/solving
  const invertMove = (m: string) => {
    if (m.endsWith("2")) return m;
    if (m.endsWith("'")) return m.slice(0, -1);
    return m + "'";
  };
  const inverseSequence = [...moves].reverse().map(invertMove);

  return {
    method: "Layer-by-Layer / CFOP Optimization",
    totalMoves: inverseSequence.length,
    phases: [
      {
        phaseName: "Step 1: Alignment & Orientation",
        explanation: "Orienting edge pieces to resolve face disparity created during scramble.",
        moves: inverseSequence.slice(0, Math.ceil(inverseSequence.length / 2)),
      },
      {
        phaseName: "Step 2: Permutation & Layer Restoration",
        explanation: "Permuting remaining corner and edge indices to restore solid face state.",
        moves: inverseSequence.slice(Math.ceil(inverseSequence.length / 2)),
      },
    ],
    fullMoveSequence: inverseSequence,
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TECXAI Server running on port ${PORT}`);
  });
}

startServer();
