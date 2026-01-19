#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

# Get the script directory
script_dir = Path(__file__).parent.absolute()
project_root = script_dir.parent.parent

# Source and destination paths
source = project_root / "backend" / "src" / "main" / "java" / "vn" / "careermate" / "userservice"
dest = script_dir / "user-service" / "src" / "main" / "java" / "vn" / "careermate" / "userservice"

print(f"Copying from: {source}")
print(f"To: {dest}")

if not source.exists():
    print(f"ERROR: Source directory not found: {source}")
    exit(1)

# Create destination directory if it doesn't exist
dest.mkdir(parents=True, exist_ok=True)

# Copy all files
if source.exists():
    shutil.copytree(source, dest, dirs_exist_ok=True)
    print(f"✓ Successfully copied user-service files")
    
    # List copied directories
    for item in dest.iterdir():
        if item.is_dir():
            print(f"  - {item.name}/")
else:
    print(f"✗ Source not found: {source}")
