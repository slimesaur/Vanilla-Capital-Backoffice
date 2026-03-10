# Deploy to AWS (Beginner Guide)

This guide walks you through deploying the Vanilla Capital Backoffice app to **AWS Lightsail** — the simplest way to get a Next.js + PostgreSQL app running on AWS.

**Cost:** ~$7/month ($3.50 for the server + $3.50 for the database)

---

## Prerequisites

- An **AWS account** (create one at https://aws.amazon.com if you don't have one)
- Your project code pushed to **GitHub** (so you can clone it on the server)

---

## Step 1: Create a PostgreSQL Database

1. Go to https://lightsail.aws.amazon.com
2. Click **Databases** tab → **Create database**
3. Choose:
   - Region: closest to you (e.g. `São Paulo` if you're in Brazil)
   - Engine: **PostgreSQL 15**
   - Plan: **$15/month** (or the cheapest available — first 3 months free!)
   - Name: `vanilla-backoffice-db`
4. Click **Create database**
5. Wait ~10 minutes for it to finish creating
6. Once ready, click on it and note down:
   - **Endpoint** (looks like: `ls-xxxx.xxxx.us-east-1.rds.amazonaws.com`)
   - **Port** (usually `5432`)
   - **User name** (usually `dbmasteruser`)
   - **Password** (click "Show" to see it)

Your `DATABASE_URL` will be:
```
postgresql://dbmasteruser:YOUR_PASSWORD@YOUR_ENDPOINT:5432/vanilla_backoffice
```

---

## Step 2: Create the Server (Lightsail Instance)

1. In Lightsail, click **Instances** tab → **Create instance**
2. Choose:
   - Region: **same region** as your database
   - Platform: **Linux/Unix**
   - Blueprint: **OS Only** → **Ubuntu 22.04 LTS**
   - Plan: **$5/month** (1 GB RAM, 1 vCPU) — first 3 months free!
   - Name: `vanilla-backoffice`
3. Click **Create instance**
4. Wait ~2 minutes

---

## Step 3: Set Up a Static IP

1. In Lightsail, go to **Networking** tab → **Create static IP**
2. Attach it to your `vanilla-backoffice` instance
3. Note down the **static IP address** (e.g. `3.123.45.67`)

---

## Step 4: Open the Firewall

1. Click on your `vanilla-backoffice` instance
2. Go to **Networking** tab
3. Under **IPv4 Firewall**, click **Add rule**:
   - Application: **HTTPS**
   - Click **Create**
4. Add another rule:
   - Application: **HTTP**
   - Click **Create**

(SSH on port 22 is open by default)

---

## Step 5: Connect to Your Server

1. Click on your instance
2. Click **Connect using SSH** (browser-based terminal opens)

Or use your own terminal:
```bash
# Download the SSH key from Lightsail > Account > SSH Keys
ssh -i YOUR_KEY.pem ubuntu@YOUR_STATIC_IP
```

---

## Step 6: Install Everything on the Server

Copy and paste these commands **one block at a time** in the SSH terminal:

### 6a. Update the system
```bash
sudo apt update && sudo apt upgrade -y
```

### 6b. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:
```bash
node -v   # should show v20.x.x
npm -v    # should show 10.x.x
```

### 6c. Install PM2 (keeps your app running)
```bash
sudo npm install -g pm2
```

### 6d. Install Nginx (web server)
```bash
sudo apt install -y nginx
```

### 6e. Install Certbot (for HTTPS/SSL — optional, needs a domain)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 7: Deploy Your App

### 7a. Clone your code
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git vanilla-backoffice
cd vanilla-backoffice
```

> **If your repo is private**, you'll need a GitHub Personal Access Token.
> Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Generate.
> Then clone with: `git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git vanilla-backoffice`

### 7b. Install dependencies
```bash
npm install
```

### 7c. Create the environment file
```bash
nano .env.local
```

Paste this (replace the values with your actual database info from Step 1):
```
DATABASE_URL="postgresql://dbmasteruser:YOUR_PASSWORD@YOUR_DB_ENDPOINT:5432/vanilla_backoffice"
NEXTAUTH_URL="http://YOUR_STATIC_IP:3000"
NEXTAUTH_SECRET="paste-a-random-string-here-make-it-long"
```

> To generate a random secret, run: `openssl rand -base64 32`

Save the file: press `Ctrl+X`, then `Y`, then `Enter`.

### 7d. Create the database tables
```bash
npx prisma generate
npx prisma db push
```

### 7e. Create the admin user
```bash
ADMIN_EMAIL="admin@vanillacapital.com.br" ADMIN_PASSWORD="your-secure-password" npx tsx prisma/seed.ts
```

### 7f. Build the app
```bash
npm run build
```

### 7g. Start the app with PM2
```bash
pm2 start npm --name "vanilla-backoffice" -- start
pm2 save
pm2 startup
```

> The last command prints a command you need to copy and run. It makes PM2 start automatically if the server reboots.

---

## Step 8: Set Up Nginx (so the app works on port 80/443)

```bash
sudo nano /etc/nginx/sites-available/vanilla-backoffice
```

Paste this:
```nginx
server {
    listen 80;
    server_name _;

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
```

Save (`Ctrl+X`, `Y`, `Enter`), then:

```bash
sudo ln -s /etc/nginx/sites-available/vanilla-backoffice /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Test It!

Open your browser and go to:
```
http://YOUR_STATIC_IP
```

You should see the login page! Sign in with the email and password you set in step 7e.

---

## Step 10 (Optional): Add a Custom Domain + HTTPS

If you have a domain name (e.g. `backoffice.yourdomain.com`):

### 10a. Point your domain to the server
Go to your domain registrar (GoDaddy, Namecheap, etc.) and add an **A record**:
- Host: `backoffice` (or `@` for root domain)
- Value: your static IP (e.g. `3.123.45.67`)

### 10b. Update Nginx
```bash
sudo nano /etc/nginx/sites-available/vanilla-backoffice
```
Change `server_name _;` to `server_name backoffice.yourdomain.com;`

```bash
sudo nginx -t && sudo systemctl restart nginx
```

### 10c. Get SSL certificate
```bash
sudo certbot --nginx -d backoffice.yourdomain.com
```

### 10d. Update your environment
```bash
cd /home/ubuntu/vanilla-backoffice
nano .env.local
```
Change `NEXTAUTH_URL` to `https://backoffice.yourdomain.com`

```bash
npm run build
pm2 restart vanilla-backoffice
```

---

## Updating Your App Later

### Option A: Manual (SSH)

```bash
cd /home/ubuntu/vanilla-backoffice
git pull
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart vanilla-backoffice
```

### Option B: Deploy script (from your Mac)

```bash
# One-time: make sure you can SSH (copy your Lightsail key or use the one from AWS console)
./scripts/deploy-aws.sh YOUR_STATIC_IP

# Or with a custom key path:
AWS_DEPLOY_HOST=3.123.45.67 AWS_DEPLOY_KEY=~/path/to/key.pem ./scripts/deploy-aws.sh
```

### Option C: GitHub Actions (auto-deploy on push to main)

1. In your repo: **Settings → Secrets and variables → Actions**
2. Add secrets:
   - `DEPLOY_HOST`: your Lightsail static IP (e.g. `3.123.45.67`)
   - `SSH_PRIVATE_KEY`: contents of your SSH private key (the `.pem` file from Lightsail)
3. Push to `main` — the workflow will deploy automatically.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows "502 Bad Gateway" | Run `pm2 status` — if the app is errored, run `pm2 logs` to see why |
| Can't connect to database | Make sure your Lightsail DB allows connections from your instance. Go to DB → Networking → add your instance |
| App crashes on start | Check `pm2 logs vanilla-backoffice` for error details |
| Forgot admin password | SSH in, run: `cd /home/ubuntu/vanilla-backoffice && ADMIN_PASSWORD="new-password" npx tsx prisma/seed.ts` |

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Lightsail instance (1GB) | $5.00 (first 3 months free) |
| Lightsail database (PostgreSQL) | $15.00 (first 3 months free) |
| Static IP | Free (when attached to instance) |
| **Total** | **~$20/month** (free for 3 months) |

> **Cheaper alternative:** Install PostgreSQL directly on the instance instead of using a managed database. This saves $15/month but you manage backups yourself. See the section below.

---

## Budget Option: PostgreSQL on the Same Server

If you want to save money, install PostgreSQL directly on your Lightsail instance instead of using a managed database:

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create the database and user
sudo -u postgres psql -c "CREATE USER vanilla WITH PASSWORD 'your-db-password';"
sudo -u postgres psql -c "CREATE DATABASE vanilla_backoffice OWNER vanilla;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vanilla_backoffice TO vanilla;"
```

Then set your `DATABASE_URL` in `.env.local` to:
```
DATABASE_URL="postgresql://vanilla:your-db-password@localhost:5432/vanilla_backoffice"
```

**Total cost with this approach: $5/month** (just the Lightsail instance).
