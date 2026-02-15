#!/bin/bash
# Start the leftovers-again bot (macOS)

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

# Activate Python virtual environment
source "${PROJECT_DIR}/venv/leftovers-again/bin/activate"
unset NPM_CONFIG_PREFIX
unset npm_config_prefix
export BOT_NICKNAME="${BOT_NICKNAME}"

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="
echo ""

cd "${PROJECT_DIR}/leftovers-again"
npm install

echo ""
echo "=========================================="
echo "Starting leftovers-again bot..."
echo "=========================================="
echo ""

npm start -- --bot=src/bot.js

echo ""
echo "=========================================="
echo "Bot process ended. Press Enter to close."
echo "=========================================="
read
