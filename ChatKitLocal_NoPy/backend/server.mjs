import fs from "fs";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

const app = express();

// root progetto = una cartella sopra /backend
const ROOT = path.resolve(process.cwd(), "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const CONFIG_PATH = path.join(ROOT, "workflows.json");

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw);
    return {
      app_name: data.app_name || "ChatKit",
      workflows: data.workflows || {},
    };
  } catch {
    return { app_name: "ChatKit", workflows: {} };
  }
}

// CORS per Vite in locale
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/config", (req, res) => {
  const cfg = loadConfig();
  res.json({ app_name: cfg.app_name, workflow_aliases: Object.keys(cfg.workflows).sort() });
});

app.get("/api/chatkit/session", async (req, res) => {
  const wf = req.query.wf;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY mancante in .env" });

  const cfg = loadConfig();
  if (!wf || !cfg.workflows[wf]) return res.status(400).json({ error: "workflow alias non valido" });

  const client = new OpenAI({ apiKey });

  try {
    // Nota: endpoint beta chatkit
    const session = await client.beta.chatkit.sessions.create({
      user: "mzu-local",
      workflow: { id: cfg.workflows[wf] },
    });

    res.json({ client_secret: session.client_secret });
  } catch (e) {
    res.status(500).json({ error: "Errore creazione sessione", details: String(e?.message || e) });
  }
});

app.listen(8787, "127.0.0.1", () => {
  console.log("Backend on http://127.0.0.1:8787");
});
