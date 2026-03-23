#!/bin/bash
# Deploy Vanilla Backoffice to AWS Lightsail
# Usage: ./scripts/deploy-aws.sh [host] [user]
# Or set env vars: AWS_DEPLOY_HOST, AWS_DEPLOY_USER, AWS_DEPLOY_KEY
# Example: AWS_DEPLOY_HOST=3.123.45.67 ./scripts/deploy-aws.sh

set -e

HOST="${1:-$AWS_DEPLOY_HOST}"
USER="${2:-${AWS_DEPLOY_USER:-ubuntu}}"
KEY="${AWS_DEPLOY_KEY:-}"

if [ -z "$HOST" ]; then
  echo "Error: Server host required."
  echo ""
  echo "Usage:"
  echo "  ./scripts/deploy-aws.sh <static-ip-or-hostname> [user]"
  echo "  # or"
  echo "  AWS_DEPLOY_HOST=<static-ip> AWS_DEPLOY_KEY=<path-to-key.pem> ./scripts/deploy-aws.sh"
  echo ""
  echo "See AWS_DEPLOY.md for setup."
  exit 1
fi

SSH_OPTS="-o StrictHostKeyChecking=no"
if [ -n "$KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $KEY"
fi

REMOTE_DIR="/home/$USER/vanilla-backoffice"
APP_NAME="vanilla-backoffice"

echo "Deploying to $USER@$HOST..."
echo ""

ssh $SSH_OPTS "$USER@$HOST" "
  set -e
  cd $REMOTE_DIR || { echo 'Error: Directory $REMOTE_DIR not found. Run initial setup from AWS_DEPLOY.md first.'; exit 1; }
  
  echo '>>> git fetch and reset to main'
  git fetch origin main && git reset --hard origin/main
  
  echo '>>> npm install'
  npm install
  
  echo '>>> npx prisma generate'
  npx prisma generate
  
  echo '>>> npx prisma db push'
  npx prisma db push
  
  echo '>>> npm run build'
  npm run build
  
  echo '>>> pm2 restart $APP_NAME'
  pm2 restart $APP_NAME
  
  echo ''
  echo 'Deploy complete!'
  pm2 status $APP_NAME
"
