import fs from "fs";
import sharp from "sharp";
import * as ort from "onnxruntime-node";
import {
  MODEL_PATH,
  INPUT_SIZE,
  CONF_THRESHOLD,
  IOU_THRESHOLD,
} from "../env.js";
import { yoloPostprocess } from "./yoloPostprocess.js";

let session;

/** Load ONNX model (once) */
async function getSession() {
  if (!session) {
    console.log(`⏳ Loading model: ${MODEL_PATH}`);
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`Model not found at ${MODEL_PATH}`);
    }
    session = await ort.InferenceSession.create(MODEL_PATH);
    console.log("✅ ONNX model ready");
  }
  return session;
}

/** Convert dataURL (or base64) -> tensor [1,3,640,640] */
async function dataUrlToTensor(dataURL) {
  const base64 = dataURL.includes(",") ? dataURL.split(",")[1] : dataURL;
  const imgBuf = Buffer.from(base64, "base64");

  // Letterbox to INPUT_SIZE x INPUT_SIZE, RGB, keep aspect ratio
  const meta = await sharp(imgBuf).metadata();
  const w = meta.width, h = meta.height;
  const scale = Math.min(INPUT_SIZE / w, INPUT_SIZE / h);
  const nw = Math.round(w * scale);
  const nh = Math.round(h * scale);

  const padded = await sharp(imgBuf)
    .resize(nw, nh, { fit: "fill" })
    .extend({
      top: Math.floor((INPUT_SIZE - nh) / 2),
      bottom: Math.ceil((INPUT_SIZE - nh) / 2),
      left: Math.floor((INPUT_SIZE - nw) / 2),
      right: Math.ceil((INPUT_SIZE - nw) / 2),
      background: { r: 114, g: 114, b: 114 },
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // NCHW float32 normalized
  const { data } = padded; // Uint8Array, length = INPUT_SIZE*INPUT_SIZE*3
  const chw = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
  let idx = 0;
  for (let c = 0; c < 3; c++) {
    for (let y = 0; y < INPUT_SIZE; y++) {
      for (let x = 0; x < INPUT_SIZE; x++) {
        chw[idx++] = data[(y * INPUT_SIZE + x) * 3 + c] / 255.0;
      }
    }
  }
  const tensor = new ort.Tensor("float32", chw, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  return { tensor, scale, padX: (INPUT_SIZE - nw) / 2, padY: (INPUT_SIZE - nh) / 2, inW: w, inH: h };
}

export async function runServerInference({ dataURL }) {
  const sess = await getSession();
  const { tensor, scale, padX, padY, inW, inH } = await dataUrlToTensor(dataURL);

  // Use the first input name dynamically
  const inputName = sess.inputNames?.[0] ?? "images";
  const outputs = await sess.run({ [inputName]: tensor });

  // Try a few common output names; otherwise, merge all float outputs
  const outTensor =
    outputs["output"] ||
    outputs["detections"] ||
    outputs[sess.outputNames?.[0]] ||
    Object.values(outputs).find((t) => t?.data?.length);

  const dets = yoloPostprocess(outTensor, {
    confThres: CONF_THRESHOLD,
    iouThres: IOU_THRESHOLD,
    inputSize: INPUT_SIZE,
    scale,
    padX,
    padY,
    origW: inW,
    origH: inH,
  });

  return { detections: dets };
}
