import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const MODE = process.env.MODE || "wasm"; // wasm or server
export const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN || "";

// ✅ Detection thresholds
export const CONF_THRESHOLD = parseFloat(process.env.CONF_THRESHOLD || "0.25");
export const IOU_THRESHOLD = parseFloat(process.env.IOU_THRESHOLD || "0.45");

// ✅ Model input size
export const INPUT_SIZE = parseInt(process.env.INPUT_SIZE || "640", 10);

// ✅ Model path
export const MODEL_PATH = process.env.MODEL_PATH || "./models/yolov5n.onnx";
