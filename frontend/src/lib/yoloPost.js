// Post-process YOLO model output
export function yoloPostprocess(outputs, confThreshold = 0.5) {
  const boxes = [];
  const [boxesArr, scoresArr] = [outputs.boxes, outputs.scores];

  for (let i = 0; i < scoresArr.length; i++) {
    if (scoresArr[i] > confThreshold) {
      boxes.push({
        label: "object", // replace with class mapping
        score: scoresArr[i],
        xmin: boxesArr[i][0],
        ymin: boxesArr[i][1],
        xmax: boxesArr[i][2],
        ymax: boxesArr[i][3],
      });
    }
  }
  return boxes;
}
