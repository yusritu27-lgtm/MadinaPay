/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Google Sheets Sync Proxy
  app.post("/api/proxy", async (req, res) => {
    const { url, action, payload } = req.body;

    if (!url) {
      res.status(400).json({ error: "Missing Target Web App URL" });
      return;
    }

    try {
      if (action === "get") {
        console.log(`[Proxy GET] Fetching from Apps Script URL: ${url}`);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("The page c") || text.includes("Google Accounts")) {
            throw new Error("Respon dari Google berupa halaman HTML (bukan JSON). Pastikan deployment Google Apps Script Anda (Web App) diatur dengan Akses: 'Anyone' (Siapa saja) dan Dijalankan sebagai: 'Me' (Diri Anda sendiri), dan Deploy/Terapkan ulang versi baru Anda.");
          }
          throw new Error("Respon server Google tidak berformat JSON valid. Layanan Google mengembalikan teks: " + text.substring(0, 150));
        }

        const data = await response.json();
        res.json({ success: true, data });
      } else if (action === "post") {
        console.log(`[Proxy POST] Posting to Apps Script URL: ${url}`);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Google Apps Script can respond with redirects (302) but native fetch handles it
        // when redirect: 'follow' (default).
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("The page c") || text.includes("Google Accounts")) {
            throw new Error("Respon dari Google berupa halaman HTML (bukan JSON). Pastikan deployment Google Apps Script Anda (Web App) diatur dengan Akses: 'Anyone' (Siapa saja) dan Dijalankan sebagai: 'Me' (Diri Anda sendiri), dan Deploy/Terapkan ulang versi baru Anda.");
          }
          throw new Error("Respon server Google tidak berformat JSON valid. Layanan Google mengembalikan teks: " + text.substring(0, 150));
        }

        const data = await response.json();
        res.json({ success: true, data });
      } else {
        res.status(400).json({ error: "Invalid action. Use 'get' or 'post'." });
      }
    } catch (error: any) {
      console.error("[Proxy Error]:", error);
      res.json({
        success: false,
        error: error.message || "Failed to communicate with Google Sheets via Apps Script."
      });
    }
  });

  // Serve other API endpoints (like a status or simple test endpoint)
  app.get("/api/status", (req, res) => {
    res.json({ status: "running", time: new Date().toISOString() });
  });

  const SETTINGS_FILE = path.join(process.cwd(), "app_settings.json");

  // API Route: Get Global Settings (shared across devices)
  app.get("/api/settings", (req, res) => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
        const data = JSON.parse(content);
        res.json({ success: true, data });
      } else {
        res.json({ success: false, message: "No settings file found yet." });
      }
    } catch (error: any) {
      console.error("[Settings GET error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route: Save Global Settings
  app.post("/api/settings", (req, res) => {
    try {
      const { config, auth, theme } = req.body;
      const dataToSave = { config, auth, theme, updatedAt: new Date().toISOString() };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
      console.log(`[Settings POST] Successfully persisted settings on server.`);
      res.json({ success: true, message: "Settings saved successfully on server." });
    } catch (error: any) {
      console.error("[Settings POST error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development vs static serve for production
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
    console.log(`[Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
