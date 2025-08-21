import { useEffect, useState } from "react";
import { getMetrics } from "../lib/metrics";

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-2">Metrics</h2>
      <ul className="text-sm text-gray-700 space-y-1">
        <li>FPS: {metrics.fps}</li>
        <li>Median Latency: {metrics.medianLatency}</li>
        <li>P95 Latency: {metrics.p95Latency}</li>
        <li>Uplink: {metrics.uplink}</li>
        <li>Downlink: {metrics.downlink}</li>
      </ul>
    </div>
  );
}
