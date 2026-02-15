#!/bin/bash
# Start the leftovers-again bot (macOS)
# Automatically creates a Python + Node.js virtual environment on first run.

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

VENV_DIR="${PROJECT_DIR}/venv/leftovers-again"
NODE_VERSION="16.20.0"

# --- Create virtual environment if it doesn't exist ---
if [ ! -f "$VENV_DIR/bin/activate" ]; then
    echo "=========================================="
    echo "Creating virtual environment..."
    echo "=========================================="
    echo ""

    python3 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"

    echo "Installing nodeenv..."
    pip install nodeenv

    echo ""
    echo "Installing Node.js v${NODE_VERSION} into venv (this may take a minute)..."
    nodeenv -p --node="$NODE_VERSION"

    echo ""
    echo "Virtual environment created successfully."
    echo ""
else
    source "$VENV_DIR/bin/activate"
fi

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
