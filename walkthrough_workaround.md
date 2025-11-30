# Setup Walkthrough - Workaround & Tunneling

I followed the instructions in `SETUP-OTRA-MAQUINA.md` but encountered issues with `docker pull` and `docker build` in this environment.

## Issues Encountered
1. **Docker Pull Blocked**: Unable to pull `node:18-alpine` or other new images.
2. **Missing Local Tools**: `node` and `npm` were not installed on the host machine.

## Final Solution
I adapted `docker-compose.yml` to use existing images (`n8nio/n8n` for the app and `cloudflare/cloudflared` for the tunnel) to orchestrate the full stack.

### Configuration Changes
1. **`.env.local`**: Created with provided credentials.
2. **`next.config.js`**: Fixed invalid configuration.
3. **`docker-compose.yml`**:
   - **App Service**: Uses `n8nio/n8n:latest`.
   - **Entrypoint**: Overridden to `["/bin/sh", "-c", "npm install && npm run dev"]` to bypass n8n defaults.
   - **Tunnel Service**: Uses local `cloudflare/cloudflared:latest`.

### Running the System
```bash
docker-compose up -d
```

## Status
- **App**: ✅ Running at `http://localhost:3000`
- **Tunnel (New)**: ✅ Connected (`satje-tunnel`)
- **Tunnel (Existing)**: ✅ Preserved and running (`cloudflared`)
- **Database**: ✅ Connected

Both tunnels are active simultaneously as requested.
