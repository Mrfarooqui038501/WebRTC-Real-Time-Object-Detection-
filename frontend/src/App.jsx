import { useState, useEffect } from "react";
import QRJoin from "./components/QRJoin";
import VideoOverlay from "./components/VideoOverlay";
import MetricsPanel from "./components/MetricsPanel";

export default function App() {
  const [detections, setDetections] = useState(null);

  // Fake detections every 2s (demo mode)
  // Replace with WebRTC/WebSocket feed in real project
  useEffect(() => {
    const interval = setInterval(() => {
      setDetections([
        {
          label: "person",
          score: 0.92,
          xmin: 0.2,
          ymin: 0.1,
          xmax: 0.6,
          ymax: 0.8,
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        📹 Real-Time Object Detection Demo
      </h1>

      {/* Phone Join Section */}
      <QRJoin />

      {/* Video + Overlay */}
      <VideoOverlay detections={detections} />

      {/* Metrics */}
      <MetricsPanel />
    </div>
  );
}
