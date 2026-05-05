#!/usr/bin/env bash

# Installation script for Cloud Gaming VM Host Service
# Run with sudo

set -euo pipefail

echo "=========================================="
echo "Cloud Gaming VM Host Installation"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/opt/cloud-gaming-vm-host"
SERVICE_NAME="vm-host"

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
  scrot \
  build-essential

# Create installation directory
echo "Creating installation directory: ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

# Copy files
# shellcheck disable=SC2115
echo "Copying files..."
rsync -a --delete \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  "${SCRIPT_DIR}/" "${INSTALL_DIR}/"

# Create default .env if not exists
if [ ! -f "${INSTALL_DIR}/.env" ]; then
  echo "Creating default configuration: ${INSTALL_DIR}/.env"
  if [ -f "${INSTALL_DIR}/.env.example" ]; then
    cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
  else
    echo "SIGNALING_SERVER_URL=http://localhost:3000" > "${INSTALL_DIR}/.env"
    echo "SIGNALING_NAMESPACE=/vm" >> "${INSTALL_DIR}/.env"
    echo "VM_ID=vm-001" >> "${INSTALL_DIR}/.env"
    echo "VM_HOSTNAME=gaming-vm-01" >> "${INSTALL_DIR}/.env"
    echo "DISPLAY=:0" >> "${INSTALL_DIR}/.env"
    echo "LOG_LEVEL=INFO" >> "${INSTALL_DIR}/.env"
  fi
fi

# Create virtual environment
echo "Creating Python virtual environment..."
cd "${INSTALL_DIR}"
python3 -m venv venv

# Install Python dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Install systemd service
echo "Installing systemd service..."
cp vm-host.service "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload

# Ensure log directory permissions are writable
chown -R root:root "${INSTALL_DIR}"
chmod -R u+rwX,go-rwx "${INSTALL_DIR}"

echo ""
echo "=========================================="
echo "Installation complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit configuration: ${INSTALL_DIR}/.env"
echo "2. Edit YAML config: ${INSTALL_DIR}/config/config.yaml"
echo "3. Start service: sudo systemctl start ${SERVICE_NAME}"
echo "4. Enable auto-start: sudo systemctl enable ${SERVICE_NAME}"
echo "5. Check status: sudo systemctl status ${SERVICE_NAME}"
echo "6. View logs: sudo journalctl -u ${SERVICE_NAME} -f"
echo ""
