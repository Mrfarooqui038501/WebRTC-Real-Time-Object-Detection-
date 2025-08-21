#!/usr/bin/env bash
set -e

MODE=${MODE:-wasm}
export MODE

echo "==> Building images (mode=$MODE)..."
docker compose build

echo "==> Starting stack..."
docker compose up -d

echo "==> Backend listening on http://localhost:8080"
echo "==> Frontend listening on http://localhost:3000"
echo "==> If NGROK_AUTHTOKEN is set, a public URL will be shown automatically in backend logs."
