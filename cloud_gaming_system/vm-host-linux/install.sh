#!/bin/bash

# Installation script for Cloud Gaming VM Host Service
# Run with sudo

set -e

echo "=========================================="
echo "Cloud Gaming VM Host Installation"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Install system dependencies
echo "Installing system dependencies..."
apt-get update
apt-get install -y \
  python3 \
  python3-pip \
  python3-venv \
  ffmpeg \
  x11-utils \
  xdotool \
  scrot

# Create installation directory
INSTALL_DIR="/opt/cloud-gaming-vm-host"
echo "Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Copy files
echo "Copying files..."
cp -r ./* "$INSTALL_DIR/"

# Create virtual environment
echo "Creating Python virtual environment..."
cd "$INSTALL_DIR"
python3 -m venv venv

# Install Python dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Update systemd service file
echo "Updating systemd service..."
sed -i "s|/usr/bin/python3|$INSTALL_DIR/venv/bin/python3|g" vm-host.service
sed -i "s|WorkingDirectory=.*|WorkingDirectory=$INSTALL_DIR|g" vm-host.service

# Install systemd service
echo "Installing systemd service..."
cp vm-host.service /etc/systemd/system/
systemctl daemon-reload

# Create config from example if not exists
if [ ! -f "$INSTALL_DIR/.env" ]; then
  echo "Creating default configuration..."
  cp .env.example .env
  echo "Please edit $INSTALL_DIR/.env with your configuration"
fi

echo ""
echo "=========================================="
echo "Installation complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit configuration: $INSTALL_DIR/.env"
echo "2. Edit YAML config: $INSTALL_DIR/config/config.yaml"
echo "3. Start service: sudo systemctl start vm-host"
echo "4. Enable auto-start: sudo systemctl enable vm-host"
echo "5. Check status: sudo systemctl status vm-host"
echo "6. View logs: sudo journalctl -u vm-host -f"
echo ""
