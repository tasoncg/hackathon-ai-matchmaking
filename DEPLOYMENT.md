# MatchBall - Deployment Guide

## Local Development

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server (LocalDB or Express)

### Backend
```bash
# From project root
dotnet restore
dotnet build
dotnet run --project src/MatchBall.Api --launch-profile http
# API runs at http://localhost:5155
# Swagger UI at http://localhost:5155/swagger
```

### Frontend
```bash
cd matchball-client
npm install
npm run dev
# Frontend runs at http://localhost:5173
# API calls proxied to backend automatically
```

### Demo Login
- Email: `player1@matchball.dev` through `player50@matchball.dev`
- Password: `Password123!`
- Players 1-5 are team captains
- Players 46-50 are field owners

---

## Docker Deployment

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# API: http://localhost:8080
# SQL Server: localhost:1433
```

---

## Cloud Deployment

### Backend → Azure App Service / Railway / Render

1. Build the Docker image:
```bash
docker build -f docker/Dockerfile.api -t matchball-api .
```

2. Environment variables:
```
ConnectionStrings__DefaultConnection=<your-sql-server-connection-string>
Jwt__Key=<your-secret-key-min-32-chars>
Jwt__Issuer=MatchBall
Jwt__Audience=MatchBall
```

### Frontend → Vercel / Netlify

1. Build:
```bash
cd matchball-client
npm run build
# Output in dist/
```

2. Environment: Update `vite.config.ts` proxy target or set `VITE_API_URL` for production API URL.

3. Deploy `dist/` folder to Vercel/Netlify with SPA rewrite rules (all routes → index.html).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | LocalDB | SQL Server connection string |
| `Jwt__Key` | `MatchBallSuperSecretKey2024!@#$%^&*()` | JWT signing key |
| `Jwt__Issuer` | `MatchBall` | JWT issuer |
| `Jwt__Audience` | `MatchBall` | JWT audience |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Runtime environment |
