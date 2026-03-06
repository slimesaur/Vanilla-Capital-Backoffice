# Deploy to Hostinger VPS

This app requires a **Hostinger VPS** (KVM 1 or higher) with Node.js support.  
Shared hosting will NOT work because the app needs a Node.js server and PostgreSQL database.

---

## Prerequisites

- Hostinger VPS with Ubuntu 22.04 or 24.04
- Domain with an A record pointing to your VPS IP
- SSH access to the VPS

---

## 1. Initial VPS Setup

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

## 2. Configure PostgreSQL

```bash
sudo -u postgres psql

# Inside psql:
CREATE USER vanilla WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE vanilla_backoffice OWNER vanilla;
GRANT ALL PRIVILEGES ON DATABASE vanilla_backoffice TO vanilla;
\q
```

## 3. Clone and Build the App

```bash
# Create app directory
mkdir -p /var/www/vanilla-backoffice
cd /var/www/vanilla-backoffice

# Clone your repo (or upload files)
git clone https://github.com/YOUR_USER/YOUR_REPO.git .

# Install dependencies
npm install

# Create production environment file
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://vanilla:YOUR_SECURE_PASSWORD@localhost:5432/vanilla_backoffice"
NEXTAUTH_URL="https://backoffice.yourdomain.com"
NEXTAUTH_SECRET="GENERATE_A_RANDOM_SECRET_HERE"
EOF

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed admin user
ADMIN_EMAIL="admin@vanillacapital.com.br" ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD" npx tsx prisma/seed.ts

# Build the app
npm run build
```

## 4. Configure PM2

```bash
# Start the app with PM2
pm2 start npm --name "vanilla-backoffice" -- start

# Save PM2 process list and set up auto-start
pm2 save
pm2 startup
```

## 5. Configure Nginx

```bash
cat > /etc/nginx/sites-available/vanilla-backoffice << 'EOF'
server {
    listen 80;
    server_name backoffice.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/vanilla-backoffice /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 6. Enable HTTPS (SSL)

```bash
certbot --nginx -d backoffice.yourdomain.com
```

## 7. Done

Visit `https://backoffice.yourdomain.com` to access the app.

Log in with the admin credentials you set during the seed step.

---

## Updating the Site

```bash
cd /var/www/vanilla-backoffice
git pull
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart vanilla-backoffice
```

---

## Migrating Data from Old App

1. Open the OLD app in a browser
2. Open browser DevTools console
3. Paste and run the content of `scripts/export-localstorage.js`
4. A JSON file will download
5. Log in to the NEW app, then POST the JSON to `/api/migrate/import`:

```bash
curl -X POST https://backoffice.yourdomain.com/api/migrate/import \
  -H "Content-Type: application/json" \
  -H "Cookie: vanilla-session=YOUR_SESSION_TOKEN" \
  -d @vanilla-backoffice-export-2025-03-05.json
```

---

## Environment Variables (Production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full URL of the app (e.g. `https://backoffice.yourdomain.com`) |
| `NEXTAUTH_SECRET` | Random secret string (generate with `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Initial admin email (used only during seed) |
| `ADMIN_PASSWORD` | Initial admin password (used only during seed) |
