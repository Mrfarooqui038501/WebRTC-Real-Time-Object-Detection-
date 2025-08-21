import { useEffect, useRef } from "react";

export default function OverlayCanvas({ detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(det => {
      const { xmin, ymin, xmax, ymax, label, score } = det;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(xmin * canvas.width, ymin * canvas.height, 
                     (xmax - xmin) * canvas.width, (ymax - ymin) * canvas.height);

      ctx.fillStyle = "lime";
      ctx.font = "16px Arial";
      ctx.fillText(`${label} (${(score * 100).toFixed(1)}%)`, xmin * canvas.width, (ymin * canvas.height) - 5);
    });
  }, [detections]);

  return <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0" />;
}
