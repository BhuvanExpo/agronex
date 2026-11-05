#!/bin/bash
while true; do
  echo "[Tunnel] Starting localtunnel on port 5001 (subdomain: agronex-live)..."
  npx --yes localtunnel --port 5001 --subdomain agronex-live
  echo "[Tunnel] Connection lost or closed. Reconnecting in 3 seconds..."
  sleep 3
done
