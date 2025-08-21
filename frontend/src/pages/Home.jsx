import VideoStream from "../components/VideoStream";
import MetricsPanel from "../components/MetricsPanel";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">📹 WebRTC VLM Multi-Object Detection</h1>
      <VideoStream />
      <MetricsPanel />
    </div>
  );
}
