#!/bin/bash

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

# Create a temporary script that activates the environment and starts the bot
cat > /tmp/leftovers_start.sh << INNER_EOF
#!/bin/bash
source ${PROJECT_DIR}/venv/leftovers-again/bin/activate
unset NPM_CONFIG_PREFIX
unset npm_config_prefix
export BOT_NICKNAME=${BOT_NICKNAME}
cd ${PROJECT_DIR}/leftovers-again

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

# Run the npm start command
npm start -- --bot=src/bot.js

# Keep the terminal open after the process ends
echo ""
echo "=========================================="
echo "Bot process ended. Press Enter to close."
echo "=========================================="
read
INNER_EOF

chmod +x /tmp/leftovers_start.sh

# Open terminal and run the script
gnome-terminal -- /tmp/leftovers_start.sh
