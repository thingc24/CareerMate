#!/bin/bash

# =========================================================================
# CareerMate Deployment Script for AWS EC2 (Ubuntu)
# This script automates the installation of Docker, Docker Compose,
# and deploys the microservices stack.
# =========================================================================

# Exit on error
set -e

echo "=== Starting CareerMate Deployment ==="

# 1. Update system packages
echo "--> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "--> Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group to run docker without sudo
    sudo usermod -aG docker $USER
    echo "--> Docker installed successfully."
else
    echo "--> Docker is already installed."
fi

# 3. Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "--> Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "--> Docker Compose installed successfully."
else
    echo "--> Docker Compose is already installed."
fi

# 4. Check for .env file
if [ ! -f .env ]; then
    echo "--> Creating .env file from .env.example..."
    cp .env.example .env
    echo "WARNING: Created default .env file. Please edit '.env' and add your GEMINI_API_KEY before running the application!"
    echo "To edit the file, run: nano .env"
fi

# 5. Build and run containers
echo "--> Pulling latest code and building docker containers..."
# Determine the correct docker compose command (v1 or v2)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo "--> Running: $DOCKER_COMPOSE_CMD up -d --build"
$DOCKER_COMPOSE_CMD up -d --build

echo "=== Deployment Completed Successfully ==="
echo "You can check the status of your services using: $DOCKER_COMPOSE_CMD ps"
echo "You can view logs using: $DOCKER_COMPOSE_CMD logs -f"
