#!/usr/bin/env bash
set -e

DUR=30
MODE="wasm"

while [[ $# -gt 0 ]]; do
  case $1 in
    --duration) DUR="$2"; shift; shift;;
    --mode) MODE="$2"; shift; shift;;
    *) shift;;
  esac
done

echo "==> Running bench for ${DUR}s (mode=${MODE})"
END=$(( $(date +%s) + DUR ))

METRICS_URL="http://localhost:8080/metrics/snapshot"
OUT="metrics.json"

# Let the system run for DUR seconds (you should keep the demo streaming)
while [ $(date +%s) -lt $END ]; do
  sleep 1
done

curl -s "$METRICS_URL" | jq . > "$OUT" || curl -s "$METRICS_URL" > "$OUT"
echo "==> Wrote $OUT"
