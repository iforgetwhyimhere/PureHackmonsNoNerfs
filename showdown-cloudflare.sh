#!/bin/bash
# Launch Pokemon Showdown Cloudflare tunnel

# Load environment variables from .env file
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/leftovers-again/.env" ]; then
    set -a
    source "$SCRIPT_DIR/leftovers-again/.env"
    set +a
else
    echo "Error: leftovers-again/.env not found."
    echo "Copy leftovers-again/.env.example to leftovers-again/.env and fill in your values."
    exit 1
fi

gnome-terminal --tab --working-directory="${PROJECT_DIR}/pokemon-showdown" \
--title="Cloudflare Tunnel" -- bash -c "cloudflared tunnel --url http://localhost:8000; exec bash"
