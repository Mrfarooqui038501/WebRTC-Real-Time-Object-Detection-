export function drawDetections(ctx, detections, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";

  detections.forEach(det => {
    const { label, score, xmin, ymin, xmax, ymax } = det;
    const x = xmin * width;
    const y = ymin * height;
    const w = (xmax - xmin) * width;
    const h = (ymax - ymin) * height;

    ctx.strokeStyle = "lime";
    ctx.fillStyle = "lime";
    ctx.strokeRect(x, y, w, h);
    ctx.fillText(`${label} ${(score * 100).toFixed(1)}%`, x + 4, y - 4);
  });
}
