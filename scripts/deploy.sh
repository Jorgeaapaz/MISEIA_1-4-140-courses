#!/bin/bash
# Deploy CourseHub to GCI VM
# Usage: ./scripts/deploy.sh

set -e

VM_USER="gcvmuser"
VM_HOST="34.174.56.186"
SSH_KEY="C:/ubuntuiso/.ssh/vboxuser"
APP_DIR="~/MISEIA1-4-140-courses"
IMAGE_NAME="coursehub"

echo "==> Building Docker image locally..."
docker build -t ${IMAGE_NAME}:latest .

echo "==> Saving image as tarball..."
docker save ${IMAGE_NAME}:latest | gzip > /tmp/coursehub.tar.gz

echo "==> Transferring image to VM..."
scp -i "${SSH_KEY}" /tmp/coursehub.tar.gz ${VM_USER}@${VM_HOST}:/tmp/coursehub.tar.gz

echo "==> Deploying on VM..."
ssh -i "${SSH_KEY}" ${VM_USER}@${VM_HOST} << 'REMOTE'
  set -e
  echo "Loading Docker image..."
  docker load < /tmp/coursehub.tar.gz

  echo "Starting/restarting container..."
  mkdir -p ~/MISEIA1-4-140-courses
  cd ~/MISEIA1-4-140-courses
  docker-compose -f docker-compose.courses.yml down || true
  docker-compose -f docker-compose.courses.yml up -d

  echo "Cleaning up..."
  rm -f /tmp/coursehub.tar.gz

  echo "Container status:"
  docker ps | grep coursehub || echo "WARNING: container not running"
REMOTE

echo "==> Cleanup local tarball..."
rm -f /tmp/coursehub.tar.gz

echo "==> Deploy complete! App should be at https://courses.deviaaps.com"
