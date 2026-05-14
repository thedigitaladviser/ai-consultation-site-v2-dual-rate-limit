# Hostinger KVM2 Deployment

This project deploys as a single full-stack Next.js container behind the existing Traefik reverse proxy. Do not split it into separate static web and API containers for v1; `/`, `/admin`, `/api/*`, auth callbacks, and scheduled callback routes all run in the same Next.js app.

## 1. Prepare VPS Folder

```bash
sudo mkdir -p /opt/ai-consultation-site
sudo chown -R "$USER":"$USER" /opt/ai-consultation-site
cd /opt/ai-consultation-site
git clone https://github.com/thedigitaladviser/ai-consultation-site-v2-dual-rate-limit.git .
```

Confirm the Traefik network name:

```bash
docker network ls
```

The provided Compose file defaults to an external network named `traefik-proxy`, configured through `TRAEFIK_NETWORK`.

If `docker network ls` does not show a Traefik network, do not deploy the app yet. Either create a shared network and attach Traefik to it, or set `TRAEFIK_NETWORK` to the existing Docker network that the Traefik container is already attached to.

To inspect Traefik's current networks:

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
docker inspect <traefik-container-name> --format '{{json .NetworkSettings.Networks}}'
```

If Traefik is already attached to `hermes-agent-ilcg_default`, set:

```bash
TRAEFIK_NETWORK=hermes-agent-ilcg_default
```

If Traefik is not attached to a reusable app network, create one and attach Traefik:

```bash
docker network create traefik-proxy
docker network connect traefik-proxy <traefik-container-name>
```

## 2. Create Production Environment

Create `/opt/ai-consultation-site/.env` from `.env.example` and fill production values.

Minimum required production values:

```bash
APP_DOMAIN=your-domain.com
TRAEFIK_NETWORK=traefik-proxy
NODE_ENV=production
NEXT_PUBLIC_TOLL_FREE_NUMBER=+1XXXXXXXXXX
VOICEFLOW_PHONE_NUMBER_ID=679550a31f50b6e4def1a2b4
DM_API_KEY=replace-with-voiceflow-key
VOICEFLOW_RUNTIME_API_BASE_URL=https://runtime-api.voiceflow.com
SQLITE_DB_PATH=/app/data/app.db
TRUST_PROXY_HEADERS=true
CRON_SECRET=replace-with-long-random-value
ADMIN_EMAILS=owner@example.com
NEXTAUTH_URL=https://your-domain.com
APP_BASE_URL=https://your-domain.com
NEXTAUTH_SECRET=replace-with-long-random-value
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
GMAIL_USER=admin-email@gmail.com
GMAIL_APP_PASSWORD=replace-with-gmail-app-password
```

Generate secrets:

```bash
openssl rand -base64 32
```

Keep `.env` private. It is ignored by git.

## 3. Configure Google OAuth

In Google Cloud Console, add this redirect URI to the OAuth web client:

```text
https://your-domain.com/api/auth/callback/google
```

For local development, also keep:

```text
http://localhost:3000/api/auth/callback/google
```

## 4. Configure DNS

Point the domain `A` record to the Hostinger VPS public IP. Traefik will handle TLS for the domain through the labels in `docker-compose.yml`.

## 5. Deploy

```bash
cd /opt/ai-consultation-site
mkdir -p data
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Smoke check from the VPS:

```bash
docker compose exec -T app curl -I http://127.0.0.1:3000
docker compose exec -T app curl -I http://127.0.0.1:3000/admin/sign-in
curl -I https://your-domain.com
curl -I https://your-domain.com/admin/sign-in
```

The app should create SQLite files under:

```bash
/opt/ai-consultation-site/data/
```

## 6. Scheduled Callback Runner

Add a host cron entry that runs every minute:

```cron
* * * * * cd /opt/ai-consultation-site && docker compose exec -T -e APP_URL=http://127.0.0.1:3000 app ./scripts/run-scheduled-callbacks.sh >> /var/log/ai-consultation-scheduler.log 2>&1
```

The script requires `CRON_SECRET` from the container environment and calls:

```text
POST /api/cron/scheduled-callbacks
```

## 7. Security Notes

- Only set `TRUST_PROXY_HEADERS=true` after confirming Traefik/Cloudflare strips client-supplied forwarding headers and injects trusted values.
- The app intentionally does not publish ports directly. Traefik routes traffic to internal container port `3000`.
- SQLite is mounted at `./data:/app/data`; do not delete this folder during redeploys.
- If you later run multiple app replicas, move persistence to Postgres or another shared database before scaling.

## 8. Useful Commands

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose up -d --build
docker compose exec app ls -la /app/data
```
