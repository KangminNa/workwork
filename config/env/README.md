# Environment Configuration

All environment templates live in this directory. Copy the relevant file to your runtime location:

- `global.example` → root `.env` for shared variables
- `server.example` → `apps/server/.env`
- `web.example` → `apps/web/.env`

```bash
cp config/env/global.example .env
cp config/env/server.example apps/server/.env
cp config/env/web.example apps/web/.env
```
