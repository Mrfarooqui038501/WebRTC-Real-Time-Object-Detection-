// frontend/src/components/VideoStream.jsx
import { useEffect, useRef, useState } from "react";
import OverlayCanvas from "./OverlayCanvas";

export default function VideoStream() {
  const W = 640, H = 480;
  const videoRef = useRef(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: W, height: H }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");

      const tick = async () => {
        if (!videoRef.current) return;
        ctx.drawImage(videoRef.current, 0, 0, W, H);
        const dataURL = canvas.toDataURL("image/jpeg", 0.7);

        try {
          const res = await fetch("http://localhost:8080/api/infer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataURL }),
          });
          const json = await res.json();
          if (json?.detections) setDetections(json.detections);
        } catch (e) {
          // ignore occasional network hiccups
        }
      };

      const interval = setInterval(tick, 500); // 2 fps; bump down if CPU is high
      return () => clearInterval(interval);
    })();
  }, []);

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <video ref={videoRef} autoPlay playsInline muted width={W} height={H} />
      <OverlayCanvas width={W} height={H} detections={detections} />
    </div>
  );
}
