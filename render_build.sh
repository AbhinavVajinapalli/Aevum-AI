#!/usr/bin/env bash
set -euo pipefail

echo "Render build helper: upgrading pip, setuptools, wheel"
python -m pip install --upgrade pip setuptools wheel

echo "Installing requirements with --prefer-binary to avoid building Rust extensions"
python -m pip install --prefer-binary -r requirements.txt

echo "Dependencies installed successfully"
