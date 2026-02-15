#!/bin/bash
# Start the leftovers-again bot (Linux)
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
    exit 1
fi

VENV_DIR="${PROJECT_DIR}/venv/leftovers-again"
NODE_VERSION="16.20.0"

# Create a temporary script that runs in the new terminal
cat > /tmp/leftovers_start.sh << 'INNER_EOF'
#!/bin/bash
PROJECT_DIR="$1"
BOT_NICKNAME="$2"
VENV_DIR="$3"
NODE_VERSION="$4"

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
export BOT_NICKNAME="$BOT_NICKNAME"
cd "$PROJECT_DIR/leftovers-again"

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="
echo ""
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
INNER_EOF

chmod +x /tmp/leftovers_start.sh

# Open terminal and run the script, passing config as arguments
gnome-terminal -- /tmp/leftovers_start.sh "$PROJECT_DIR" "$BOT_NICKNAME" "$VENV_DIR" "$NODE_VERSION"
