#!/bin/bash
# Launch Pokemon Showdown Cloudflare tunnel (macOS)

# Load environment variables from .env file
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/leftovers-again/.env" ]; then
    set -a
    source "$SCRIPT_DIR/leftovers-again/.env"
    set +a
else
    echo "Error: leftovers-again/.env not found."
    echo "Copy leftovers-again/.env.example to leftovers-again/.env and fill in your values."
    read -p "Press Enter to close."
    exit 1
fi

echo "=========================================="
echo "Starting Cloudflare Tunnel..."
echo "=========================================="
echo ""

cd "${PROJECT_DIR}/pokemon-showdown"
cloudflared tunnel --url http://localhost:8000

echo ""
echo "=========================================="
echo "Tunnel stopped. Press Enter to close."
echo "=========================================="
read
