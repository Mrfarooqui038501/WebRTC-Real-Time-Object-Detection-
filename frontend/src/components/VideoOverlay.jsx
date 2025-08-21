import { useEffect, useRef } from "react";

export default function VideoOverlay({ detections }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔹 Load webcam stream (for now laptop camera, later replace with WebRTC remote stream)
  useEffect(() => {
    async function setupVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access webcam:", err);
      }
    }
    setupVideo();
  }, []);

  // 🔹 Draw bounding boxes whenever detections change
  useEffect(() => {
    if (!detections || detections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!video || !canvas) return;

    const draw = () => {
      if (!video.videoWidth || !video.videoHeight) return;

      // Resize canvas to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      detections.forEach((det) => {
        const { label, score, xmin, ymin, xmax, ymax } = det;

        // Convert normalized [0,1] to actual pixel coordinates
        const x = xmin * canvas.width;
        const y = ymin * canvas.height;
        const w = (xmax - xmin) * canvas.width;
        const h = (ymax - ymin) * canvas.height;

        // Draw rectangle
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Label + score
        ctx.fillStyle = "lime";
        ctx.font = "16px Arial";
        ctx.fillText(`${label} (${(score * 100).toFixed(1)}%)`, x, y > 20 ? y - 5 : y + 15);
      });
    };

    draw();
  }, [detections]);

  return (
    <div className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-md">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}
