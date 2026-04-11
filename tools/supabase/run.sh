#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLI_CMD=(npx --prefix "$ROOT_DIR/tools/supabase" supabase)

case "${1:-}" in
  start)
    (cd "$ROOT_DIR" && "${CLI_CMD[@]}" start)
    ;;
  stop)
    (cd "$ROOT_DIR" && "${CLI_CMD[@]}" stop)
    ;;
  status)
    (cd "$ROOT_DIR" && "${CLI_CMD[@]}" status)
    ;;
  *)
    echo "Usage: $(basename "$0") {start|stop|status}"
    exit 1
    ;;
 esac
