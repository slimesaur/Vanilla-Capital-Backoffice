# Ops: SSH and production access

Short reference for humans (and agents). **Do not commit private keys, `.pem` files, or passwords** to this repo.

## Lightsail server

- **User:** `ubuntu`
- **Host (current):** `44.223.144.73` — confirm in the Lightsail console; the public IP changes if you recreate the instance (then update DNS, `DEPLOY_HOST`, and `~/.ssh/config`).
- **App path (typical):** `/home/ubuntu/vanilla-backoffice`

## One-time setup on your Mac

1. Store the Lightsail key in a fixed place, e.g. `~/.ssh/lightsail-vanilla.pem`.
2. Restrict permissions: `chmod 400 ~/.ssh/lightsail-vanilla.pem`
3. Optional `~/.ssh/config` entry so you only type a short host name:

```text
Host vanilla-lightsail
  HostName 44.223.144.73
  User ubuntu
  IdentityFile ~/.ssh/lightsail-vanilla.pem
  IdentitiesOnly yes
```

Then connect with:

```bash
ssh vanilla-lightsail
```

Nginx and Let’s Encrypt on the server are set for both `vanillacapital.com.br` and `www.vanillacapital.com.br` (expand the cert again if you add more hostnames).

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
