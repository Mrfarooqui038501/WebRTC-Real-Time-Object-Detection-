import * as ort from "onnxruntime-web"; // npm install onnxruntime-web

let session = null;

export async function initWasmDetector(modelUrl = "/models/yolov5n.onnx") {
  session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ["wasm"],
  });
  return session;
}

export async function runWasmDetector(inputTensor) {
  if (!session) throw new Error("Detector not initialized");

  const feeds = { images: inputTensor };
  const results = await session.run(feeds);

  return results;
}
