# Vanilla Capital – Lightsail setup guide

One-time setup so GitHub can deploy automatically. Do this once.

---

## YOU ARE HERE

Based on your checklist (Steps 0–2 done): **you are on Step 3.**

**Next:** Connect via SSH (Step 0), then run Step 3 (clone the repo).

**Not sure?** Once connected via SSH, paste this to see what's actually done on the server:

```bash
echo "PostgreSQL:"; which psql || echo "  Not installed"; echo "Database user vanilla:"; sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='vanilla'" 2>/dev/null | grep -q 1 && echo "  Exists" || echo "  Not created"; echo "Repo folder:"; ls -d /home/ubuntu/vanilla-backoffice 2>/dev/null && echo "  Exists" || echo "  Not cloned"; echo "PM2 app:"; pm2 list 2>/dev/null | grep vanilla-backoffice || echo "  Not running"
```

---

## Checklist

Mark each step when done:

- [X] **Step 0** – SSH connected to server
- [X] **Step 1** – PostgreSQL installed
- [X] **Step 2** – Database created
- [ ] **Step 3** – Repo cloned
- [ ] **Step 4** – `.env.local` created
- [ ] **Step 5** – App installed and built
- [ ] **Step 6** – App started with PM2
- [ ] **Step 7** – Verified it works

---

## Step 0: Connect to your server

Open Terminal on your Mac and run:

```bash
ssh -i ~/Downloads/LightsailDefaultKey-us-east-1.pem ubuntu@44.223.144.73
```

If asked `Are you sure you want to continue connecting?` → type `yes` and press Enter.

You’re connected when you see something like `ubuntu@ip-172-...`.

---

## Step 1: Install PostgreSQL

Copy and paste this entire block, then press Enter:

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
```

Wait until it finishes (about 1–2 minutes).

- [ ] Step 1 done

---

## Step 2: Create the database

Choose a password (example: `MySecurePass123`). You’ll use it in Step 4.

Replace `MySecurePass123` in the commands below with your password, then run them one by one:

```bash
sudo -u postgres psql -c "CREATE USER vanilla WITH PASSWORD 'MySecurePass123';"
sudo -u postgres psql -c "CREATE DATABASE vanilla_backoffice OWNER vanilla;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vanilla_backoffice TO vanilla;"
sudo -u postgres psql -c "ALTER USER vanilla CREATEDB;"
```

- [ ] Step 2 done (remember your password)

---

## Step 3: Clone the repo

If you already cloned before, skip this step. Otherwise run:

```bash
cd /home/ubuntu
git clone https://github.com/slimesaur/Vanilla-Capital-Backoffice.git vanilla-backoffice
```

- [ ] Step 3 done

---

## Step 4: Create `.env.local`

Replace `MySecurePass123` with the same password you used in Step 2:

```bash
cd /home/ubuntu/vanilla-backoffice

cat > .env.local << 'EOF'
DATABASE_URL="postgresql://vanilla:MySecurePass123@localhost:5432/vanilla_backoffice"
NEXTAUTH_URL="http://44.223.144.73"
NEXTAUTH_SECRET="vanilla-secret-change-this-in-production"
EOF
```

- [ ] Step 4 done

---

## Step 5: Install and build the app

Run each command and wait for it to finish. The build can take 2–3 minutes:

```bash
cd /home/ubuntu/vanilla-backoffice

npm install
```

```bash
npx prisma generate
```

```bash
npx prisma db push
```

```bash
ADMIN_EMAIL="admin@vanillacapital.com.br" ADMIN_PASSWORD="vanilla2025" npx tsx prisma/seed.ts
```

```bash
npm run build
```

If any command fails, stop and check the error message.

- [ ] Step 5 done

---

## Step 6: Start the app with PM2

```bash
cd /home/ubuntu/vanilla-backoffice

pm2 start npm --name "vanilla-backoffice" -- start
pm2 save
pm2 startup
```

`pm2 startup` will print a line that starts with `sudo env`.  
Copy that entire line, paste it, and run it.

- [ ] Step 6 done

---

## Step 7: Verify

```bash
pm2 status
```

You should see `vanilla-backoffice` with status `online`.

Then open in your browser: **http://44.223.144.73**

You should see the Vanilla Capital landing page.  
Login with: `admin@vanillacapital.com.br` / `vanilla2025`

- [ ] Step 7 done

---

## After setup: GitHub deploys

When this one-time setup is done:

1. Ensure GitHub secrets are set: `DEPLOY_HOST` and `SSH_PRIVATE_KEY`
2. Push to `main` → GitHub Actions will deploy automatically

No more manual setup needed for future deployments.
