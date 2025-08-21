let frameCount = 0;
let startTime = null;
let latencies = [];

export function recordFrame(captureTs, displayTs) {
  if (!startTime) startTime = Date.now();
  frameCount++;

  if (captureTs && displayTs) {
    latencies.push(displayTs - captureTs);
  }
}

export function getMetrics() {
  const duration = (Date.now() - startTime) / 1000;
  const fps = frameCount / duration;

  const sorted = [...latencies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;

  return {
    fps: fps.toFixed(1),
    medianLatency: `${median} ms`,
    p95Latency: `${p95} ms`,
    uplink: "N/A", // to be filled from WebRTC stats
    downlink: "N/A"
  };
}
