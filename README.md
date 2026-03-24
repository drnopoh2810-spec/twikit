---
title: Twitter Unofficial API
emoji: 🐦
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: true
app_port: 7860
---

# Twitter Unofficial API

A full-stack web app and API for Twitter login automation using internal Twitter endpoints.

## Features

- 🔐 Full login flow (JS instrumentation, SSO, password)
- 🛡️ 2FA & checkpoint support
- 🌐 Proxy support (HTTP/HTTPS)
- 🍪 Cookie & ct0 extraction
- 🔄 Auto retry with backoff
- 🐳 Docker ready (HuggingFace Spaces compatible)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | API info |
| POST | `/api/login` | Login to Twitter |

### POST /api/login

```json
{
  "username": "your_username",
  "password": "your_password",
  "email": "optional@email.com",
  "twoFactorCode": "optional",
  "checkpointCode": "optional",
  "proxy": "http://user:pass@host:port",
  "language": "en"
}
```

## Run Locally

```bash
# Docker
docker compose up -d

# Or Node.js
npm install
npm run build
npm start
```

## Deploy to HuggingFace Spaces

Push this repo to a HuggingFace Space with Docker SDK. The app runs on port 7860.

## License

MIT · [cy4udev](https://cy4u.dev)
