#!/bin/bash
# Deploy nginx config to Lightsail for vanillacapital.com.br
# Usage: ./deploy/setup-nginx-domain.sh [http-only|ssl]
#   http-only  = use before running certbot (default)
#   ssl        = use after certbot succeeds
#
# Requires: AWS_DEPLOY_HOST, AWS_DEPLOY_KEY (optional, for SSH key path)
# Example: AWS_DEPLOY_HOST=44.223.144.73 AWS_DEPLOY_KEY=~/Downloads/LightsailDefaultKey-us-east-1.pem ./deploy/setup-nginx-domain.sh

set -e

MODE="${1:-http-only}"
HOST="${AWS_DEPLOY_HOST:-44.223.144.73}"
USER="${AWS_DEPLOY_USER:-ubuntu}"
KEY="${AWS_DEPLOY_KEY:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$MODE" in
  http-only)
    CONFIG="$SCRIPT_DIR/nginx-http-only.conf"
    ;;
  ssl)
    CONFIG="$SCRIPT_DIR/nginx-ssl.conf"
    ;;
  *)
    echo "Usage: $0 [http-only|ssl]"
    exit 1
    ;;
esac

if [ ! -f "$CONFIG" ]; then
  echo "Error: Config file not found: $CONFIG"
  exit 1
fi

SSH_OPTS="-o StrictHostKeyChecking=no"
[ -n "$KEY" ] && SSH_OPTS="$SSH_OPTS -i $KEY"

echo "Deploying nginx config ($MODE) to $USER@$HOST..."
scp $SSH_OPTS "$CONFIG" "$USER@$HOST:/tmp/vanilla-backoffice-nginx.conf"

ssh $SSH_OPTS "$USER@$HOST" "
  sudo mv /tmp/vanilla-backoffice-nginx.conf /etc/nginx/sites-available/vanilla-backoffice
  sudo nginx -t && sudo systemctl restart nginx
  echo 'Done! Nginx restarted.'
"
