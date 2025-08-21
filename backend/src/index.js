import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { PORT, MODE, NGROK_AUTHTOKEN } from "./env.js";
import { attachSignaling } from "./signaling.js";
import { metricsRouter, metrics } from "./metrics.js";
import { apiRouter } from "./routes.js";
import { WebSocketServer } from "ws";
import ngrok from "@ngrok/ngrok";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/metrics", metricsRouter);
app.use("/api", apiRouter);

// --- New API endpoint for public URL ---
let publicUrl = null;
app.get("/api/public-url", (req, res) => {
  res.json({ url: publicUrl });
});

const server = http.createServer(app);
attachSignaling(server, metrics);

server.listen(PORT, async () => {
  console.log(`✅ Server listening on :${PORT} (mode=${MODE})`);

  // If ngrok token exists → create tunnel
  if (NGROK_AUTHTOKEN) {
    try {
      const listener = await ngrok.connect({
        addr: PORT,
        authtoken: NGROK_AUTHTOKEN,
      });
      publicUrl = listener.url();
      console.log(`🌍 Public URL via ngrok: ${publicUrl}`);
    } catch (err) {
      console.error("❌ Ngrok failed:", err.message);
    }
  }
});
