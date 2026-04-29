#!/bin/bash

# Vela Protocol - Production Keeper Deployment Script
# Intended for Ubuntu 22.04 LTS (Digital Ocean $5/mo Droplet)

set -e

echo "Starting Vela Keeper Deployment..."

# 1. Update system and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# 2. Install Node.js (v20 LTS)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Clone repository (assuming SSH key is set up, or public repo)
# If running this inside an already cloned repo, we just cd to the directory.
# For this script, we assume it's run from within the keeper directory.

echo "Installing Keeper dependencies..."
npm install

# 5. Build the TypeScript keeper
echo "Building Keeper service..."
npm run build

# 6. Setup environment variables
echo "Please ensure your .env file is configured correctly in the keeper directory."
echo "Required: SOLANA_RPC_URL (mainnet), KEEPER_PRIVATE_KEY"

# 7. Start PM2 process
echo "Starting PM2 process..."
pm2 start dist/index.js --name "vela-keeper"

# 8. Save PM2 state to restart on boot
pm2 save
pm2 startup

echo "Deployment complete! Check logs with: pm2 logs vela-keeper"
