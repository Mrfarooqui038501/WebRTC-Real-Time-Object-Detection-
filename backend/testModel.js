import ort from "onnxruntime-node";
import fs from "fs";

const modelPath = "./models/yolov5n.onnx";

async function testModel() {
  try {
    // Load the ONNX model
    const session = await ort.InferenceSession.create(modelPath);
    console.log("✅ Model loaded successfully:", modelPath);

    // Create dummy input tensor (batch=1, 3 channels, 640x640)
    const inputTensor = new ort.Tensor("float32", new Float32Array(1 * 3 * 640 * 640), [1, 3, 640, 640]);

    // Run inference
    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);

    console.log("✅ Inference ran successfully!");
    console.log("Output keys:", Object.keys(results));
  } catch (err) {
    console.error("❌ Model test failed:", err);
  }
}

testModel();
