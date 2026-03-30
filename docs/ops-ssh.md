# Ops: SSH and production access

Short reference for humans (and agents). **Do not commit private keys, `.pem` files, or passwords** to this repo.

## Lightsail server

- **User:** `ubuntu`
- **Host:** set in your DNS / use the instance public IPv4 (see `SETUP-LIGHTSAIL.md` for the full bootstrap checklist).
- **App path (typical):** `/home/ubuntu/vanilla-backoffice`

## One-time setup on your Mac

1. Store the Lightsail key in a fixed place, e.g. `~/.ssh/lightsail-vanilla.pem`.
2. Restrict permissions: `chmod 400 ~/.ssh/lightsail-vanilla.pem`
3. Optional `~/.ssh/config` entry so you only type a short host name:

```text
Host vanilla-lightsail
  HostName YOUR_LIGHTSAIL_PUBLIC_IP
  User ubuntu
  IdentityFile ~/.ssh/lightsail-vanilla.pem
```

Then connect with:

```bash
ssh vanilla-lightsail
```

Replace `YOUR_LIGHTSAIL_PUBLIC_IP` with the real address from the AWS Lightsail console (it can change if you recreate the instance; update DNS and this config if it does).

## HTTPS and `www`

DNS should point both the apex and `www` at the same server. If the browser shows a certificate error for `www`, the TLS cert must include **both** names.

On the server, ensure Nginx `server_name` lists both `vanillacapital.com.br` and `www.vanillacapital.com.br`, then expand the certificate, for example:

```bash
sudo certbot --nginx -d vanillacapital.com.br -d www.vanillacapital.com.br
```

Reload Nginx after Certbot finishes (`sudo nginx -t && sudo systemctl reload nginx`).

## GitHub Actions deploy

Workflow: `.github/workflows/deploy-aws.yml`

**Repository secrets** (Settings → Secrets and variables → Actions):

| Secret            | Purpose                          |
|-------------------|----------------------------------|
| `DEPLOY_HOST`     | Lightsail public IP or hostname  |
| `SSH_PRIVATE_KEY` | Private key that can SSH as `ubuntu` (full PEM contents) |

CI holds the deploy key; your laptop key can stay only on your machine.
