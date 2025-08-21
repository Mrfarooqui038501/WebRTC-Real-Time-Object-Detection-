// server/src/routes.js
import express from "express";
import { MODE } from "./env.js";
import { runServerInference } from "./inference/onnxServer.js";

export const apiRouter = express.Router();

apiRouter.get("/health", (_req, res) => res.json({ ok: true, mode: MODE }));

// POST /api/infer { dataURL: "data:image/jpeg;base64,...." }
apiRouter.post("/infer", async (req, res) => {
  if (MODE !== "server") {
    return res.status(400).json({ error: "Server inference disabled in wasm mode" });
  }
  try {
    const { dataURL } = req.body || {};
    if (!dataURL) return res.status(400).json({ error: "Missing dataURL" });

    const result = await runServerInference({ dataURL });
    return res.json(result);
  } catch (err) {
    console.error("❌ Inference error:", err);
    return res.status(500).json({ error: "inference_failed" });
  }
});
