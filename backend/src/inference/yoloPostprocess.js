const COCO_CLASSES = [
  "person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train",
  "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter",
  "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear",
  "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase",
  "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
  "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle",
  "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
  "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut",
  "cake", "chair", "sofa", "pottedplant", "bed", "diningtable", "toilet", "tv",
  "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven",
  "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors",
  "teddy bear", "hair drier", "toothbrush"
];

/**
 * Calculate Intersection over Union (IoU) for two boxes
 */
function iou(boxA, boxB) {
  const xA = Math.max(boxA.xmin, boxB.xmin);
  const yA = Math.max(boxA.ymin, boxB.ymin);
  const xB = Math.min(boxA.xmax, boxB.xmax);
  const yB = Math.min(boxA.ymax, boxB.ymax);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = (boxA.xmax - boxA.xmin) * (boxA.ymax - boxA.ymin);
  const boxBArea = (boxB.xmax - boxB.xmin) * (boxB.ymax - boxB.ymin);

  return interArea / (boxAArea + boxBArea - interArea);
}

/**
 * Non-Max Suppression (NMS)
 */
function nonMaxSuppression(boxes, iouThreshold = 0.45) {
  boxes.sort((a, b) => b.score - a.score);
  const results = [];

  while (boxes.length) {
    const chosen = boxes.shift();
    results.push(chosen);

    boxes = boxes.filter(b => iou(chosen, b) < iouThreshold);
  }
  return results;
}

/**
 * Main post-processing for YOLO output
 */
export function yoloPostprocess(outputs, confThreshold = 0.25, iouThreshold = 0.45) {
  const detections = [];

  // Assume ONNX output: [batch, boxes, attributes]
  // attributes = [x,y,w,h, obj_conf, ...class_scores]
  const output = outputs.output.data || outputs.output; // handle ORT format
  const numAttrs = 85; // YOLOv5: 4 box coords + 1 obj_conf + 80 classes
  const numDetections = output.length / numAttrs;

  for (let i = 0; i < numDetections; i++) {
    const offset = i * numAttrs;
    const x = output[offset];
    const y = output[offset + 1];
    const w = output[offset + 2];
    const h = output[offset + 3];
    const objConf = output[offset + 4];

    // class probs
    let classId = -1;
    let bestScore = 0;
    for (let c = 5; c < numAttrs; c++) {
      const classProb = output[offset + c];
      if (classProb > bestScore) {
        bestScore = classProb;
        classId = c - 5;
      }
    }

    const finalScore = objConf * bestScore;
    if (finalScore > confThreshold) {
      detections.push({
        label: COCO_CLASSES[classId] || "object",
        score: finalScore,
        xmin: x - w / 2,
        ymin: y - h / 2,
        xmax: x + w / 2,
        ymax: y + h / 2
      });
    }
  }

  return nonMaxSuppression(detections, iouThreshold);
}
