import sharp from "sharp";

/**
 * Preprocess image for YOLO ONNX
 * @param {Buffer} imageBuffer - raw image buffer (jpg/png)
 * @param {number} size - model input size (default 640 for YOLOv5n)
 */
export async function preprocessImage(imageBuffer, size = 640) {
  // Resize and convert to RGB
  const resized = await sharp(imageBuffer)
    .resize(size, size, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;

  // Normalize [0,255] → [0,1]
  const floatArray = new Float32Array(info.width * info.height * 3);
  for (let i = 0; i < data.length; i++) {
    floatArray[i] = data[i] / 255.0;
  }

  // YOLO expects [1,3,H,W]
  const tensor = new Float32Array(size * size * 3);
  let idx = 0;
  for (let c = 0; c < 3; c++) {           // channel
    for (let y = 0; y < size; y++) {      // height
      for (let x = 0; x < size; x++) {    // width
        tensor[idx++] = floatArray[(y * size + x) * 3 + c];
      }
    }
  }

  return new ort.Tensor("float32", tensor, [1, 3, size, size]);
}
