import express from 'express';

export const metrics = {
  frames: [],
  ingestClientMetric(m) {
    // m: { overlay_display_ts, capture_ts, recv_ts, inference_ts, processed }
    this.frames.push(m);
    if (this.frames.length > 5000) this.frames.splice(0, 1000);
  },
  snapshot() {
    const arr = this.frames.slice(-1200); // ~last ~2min worst-case
    if (arr.length === 0) return { frames: 0 };

    const e2e = arr
      .filter(f => f.overlay_display_ts && f.capture_ts)
      .map(f => f.overlay_display_ts - f.capture_ts);
    const server = arr
      .filter(f => f.inference_ts && f.recv_ts)
      .map(f => f.inference_ts - f.recv_ts);
    const net = arr
      .filter(f => f.recv_ts && f.capture_ts)
      .map(f => f.recv_ts - f.capture_ts);

    const quant = (xs, p) => {
      if (!xs.length) return null;
      const s = xs.slice().sort((a,b)=>a-b);
      const idx = Math.floor((p/100) * (s.length-1));
      return s[idx];
    };

    const fps = (() => {
      const seconds = (arr[arr.length-1].overlay_display_ts - arr[0].overlay_display_ts)/1000 || 1;
      const processed = arr.filter(f => f.processed).length;
      return processed/seconds;
    })();

    return {
      frames: arr.length,
      fps: Number(fps.toFixed(2)),
      e2e_median_ms: quant(e2e, 50),
      e2e_p95_ms: quant(e2e, 95),
      server_median_ms: quant(server, 50),
      server_p95_ms: quant(server, 95),
      network_median_ms: quant(net, 50),
      network_p95_ms: quant(net, 95),
      uplink_kbps_est: null,
      downlink_kbps_est: null
    };
  }
};

export const metricsRouter = express.Router();
metricsRouter.get('/snapshot', (req, res) => {
  res.json(metrics.snapshot());
});
