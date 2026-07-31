# Deployment Guide

## Overview

Meteor is a NestJS backend with PostgreSQL and Redis. It is containerized with Docker and designed to run in production behind a reverse proxy (e.g., Nginx, Traefik, or Cloudflare).

## Architecture

```
                         ┌──────────────┐
                         │   Reverse    │
                         │   Proxy      │
                         │ (Nginx/CF)   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   Meteor     │
                         │   (Node 24)  │
                         └──────┬───────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
          ┌──────────┐   ┌──────────┐   ┌──────────┐
          │PostgreSQL│   │  Redis   │   │  Monad   │
          │   17     │   │    7     │   │   RPC    │
          └──────────┘   └──────────┘   └──────────┘
```

## Prerequisites

- Docker & Docker Compose (recommended)
- Node.js >= 24 (for bare-metal deployment)
- PostgreSQL 17
- Redis 7
- Monad RPC endpoint (testnet or mainnet)
- Google Gemini API key

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment (`production`, `development`, `test`) |
| `PORT` | No | `4000` | Application port |
| `API_PREFIX` | No | `api` | API prefix |
| `API_VERSION` | No | `1` | API version |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `REDIS_HOST` | **Yes** | — | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (min 32 chars in production) |
| `JWT_EXPIRATION` | No | `900` | Access token expiry in seconds |
| `JWT_REFRESH_EXPIRATION` | No | `604800` | Refresh token expiry in seconds |
| `MONAD_RPC_URL` | Production | `https://testnet-rpc.monad.xyz` | Monad RPC endpoint |
| `MONAD_CHAIN_ID` | No | `10143` | Monad chain ID |
| `MONAD_ESCROW_CONTRACT_ADDRESS` | Production | — | Escrow contract address |
| `GEMINI_API_KEY` | Production | — | Google Gemini API key |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `LOG_LEVEL` | No | `debug` | Logging level (`debug`, `info`, `warn`, `error`) |

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and configure
git clone <repo-url>
cd meteor
cp .env.example .env
# Edit .env with your production values

# 2. Build and start all services
docker compose up -d

# 3. Run database migrations
docker compose exec app npx prisma migrate deploy

# 4. Verify health
curl http://localhost:4000/health
```

### Option 2: Docker (separate database)

```bash
# Build production image
docker build --target production -t meteor:latest .

# Run container
docker run -d \
  --name meteor \
  -p 4000:4000 \
  --env-file .env \
  meteor:latest
```

### Option 3: Bare Metal

```bash
# 1. Install dependencies and build
npm ci
npm run prisma:generate
npm run build

# 2. Run database migrations
npx prisma migrate deploy

# 3. Start server
NODE_ENV=production npm run start:prod
```

## Health Checks

The application exposes three health endpoints, all without authentication:

| Endpoint | Purpose | Expected Status |
|----------|---------|-----------------|
| `GET /health` | Full check (DB + Redis) | `ok` or `degraded` |
| `GET /health/live` | Liveness (K8s) | Always `alive` |
| `GET /health/ready` | Readiness (K8s) | `ready` or `not ready` |

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /health/ready
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 15
  failureThreshold: 3
```

### Docker Compose Healthcheck

The app service includes a built-in healthcheck (30s interval, 10s timeout, 3 retries, 40s start period).

## Logging

- **Development**: Human-readable logs via `pino-pretty`
- **Production**: Structured JSON logs (set `LOG_LEVEL=info` or `warn`)
- Logs are output to stdout/stderr (collect via Docker, systemd, or your logging infrastructure)

## Security Checklist

- [ ] `JWT_SECRET` is at least 32 characters, generated with `openssl rand -base64 48`
- [ ] `DATABASE_URL` uses a strong password
- [ ] `CORS_ORIGIN` is set to your frontend domain (not `*`)
- [ ] Rate limiting is enabled (100 req / 15 min per IP, configurable)
- [ ] Helmet security headers are enabled
- [ ] Database firewall restricts access to app server IP
- [ ] Redis is configured with `requirepass` in production
- [ ] TLS/SSL is terminated at the reverse proxy
- [ ] Regular backups of PostgreSQL are configured
- [ ] Monad private keys are stored in a secrets manager (not env vars)

## Performance Tuning

### PostgreSQL
- Ensure proper indexing (Prisma migrations include recommended indexes)
- Set `shared_buffers` to 25% of RAM for dedicated DB servers
- Configure `work_mem` for query sorting

### Node.js
- The app uses clustering (single process by default)
- For multi-core, use `pm2` or Kubernetes horizontal scaling
- Set `NODE_OPTIONS="--max-old-space-size=512"` for memory limits

### Redis
- Used for caching and WebSocket pub/sub
- Set `maxmemory` policy to `allkeys-lru` for cache-only usage

## Monitoring

- **Health endpoints** for basic uptime monitoring
- **Structured JSON logs** for log aggregation (ELK, Datadog, etc.)
- **Swagger UI** at `http://localhost:4000/docs` for API testing
- Consider adding Prometheus metrics for advanced monitoring

## Troubleshooting

### Application fails to start
1. Run `node -e "require('./dist/env.validation').validateEnv()"` to check env vars
2. Verify database connectivity: `psql $DATABASE_URL`
3. Verify Redis connectivity: `redis-cli -h $REDIS_HOST ping`
4. Check logs: `docker compose logs app`

### Database connection errors
1. Ensure PostgreSQL is running and reachable
2. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/db`
3. Check network/firewall rules
4. Verify SSL requirements are configured

### WebSocket connection failures
1. Ensure the client sends `auth.token` in the handshake
2. Verify the JWT is valid and not expired
3. Check that the WebSocket path matches the server configuration
