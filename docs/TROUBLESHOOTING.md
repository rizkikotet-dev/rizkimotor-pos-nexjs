# Troubleshooting Guide — RIZKI MOTOR POS

---

## Quick Diagnostics

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| `npm run dev` fails | Node version < 20 | `nvm use 20` or install Node 20+ |
| `prisma db push` fails | DATABASE_URL wrong | Check `.env`, run `cp .env.example .env` |
| Build fails on Vercel | SQLite in production | Use PostgreSQL + `schema.vercel.prisma` |
| Login fails | NEXTAUTH_SECRET missing | Generate: `openssl rand -base64 32` |
| Images 404 on Vercel | Local filesystem | Use Uploadthing/Cloudinary/S3 |
| Port 3000 in use | Another process | `lsof -i :3000` then `kill -9 <PID>` |
| Docker permission denied | Entrypoint not executable | `chmod +x docker-entrypoint.sh` |

---

## Database Issues

### `prisma db push` fails with "Can't reach database server"
```bash
# SQLite (dev)
ls -la prisma/dev.db          # File exists?
sqlite3 prisma/dev.db ".tables"  # Can open?

# PostgreSQL (prod)
psql "$DATABASE_URL" -c "\dt"  # Test connection
```
**Fix**: Check `DATABASE_URL` in `.env`. For PostgreSQL, ensure host allows connections (Neon/Supabase: allow 0.0.0.0/0 or your IP).

### "P1001: Can't reach database server" on Vercel
- Vercel serverless functions need PostgreSQL (not SQLite)
- Use `prisma/schema.vercel.prisma` (provider = postgresql)
- Set `DATABASE_URL` in Vercel Environment Variables
- Build command runs `prisma db push` automatically

### Reset Database Completely
```bash
# SQLite (dev)
rm -f prisma/dev.db
npm run db:push
npm run db:seed

# PostgreSQL (prod) — DANGEROUS, data loss
npx prisma db push --force-reset --schema=prisma/schema.vercel.prisma
npx tsx prisma/seed.ts
```

### Prisma Client Out of Sync
```bash
npx prisma generate
# If still failing:
rm -rf node_modules/.prisma
npm run postinstall
```

### Migration Issues (PostgreSQL)
```bash
# Create migration
npx prisma migrate dev --name descriptive_name

# Apply in production
npx prisma migrate deploy

# If migration fails (e.g., data conflict)
npx prisma migrate resolve --applied <migration_name>
# Then fix data manually, or:
npx prisma db push --force-reset  # Nuclear option
```

---

## Authentication Issues

### "NEXTAUTH_SECRET is not set" / "Invalid secret"
```bash
# Generate proper secret
openssl rand -base64 32
# Add to .env and Vercel Environment Variables
```
**Requirements**: ≥32 chars, not the example value.

### "NEXTAUTH_URL mismatch" / Callback URL error
- Development: `NEXTAUTH_URL=http://localhost:3000`
- Production: `NEXTAUTH_URL=https://your-domain.vercel.app`
- Must match **exactly** (no trailing slash, correct protocol)
- For Vercel Preview: set in Preview env vars too

### Session Not Persisting / Logged Out on Refresh
- Check `NEXTAUTH_URL` matches browser URL
- Cookies need `secure: true` in production (HTTPS)
- Vercel: ensure `NEXTAUTH_URL` set for Production **and** Preview
- Clear browser cookies for domain, re-login

### "bcrypt" / "bcryptjs" Errors on Vercel
```bash
# Use bcryptjs (pure JS) not bcrypt (native)
npm uninstall bcrypt
npm install bcryptjs @types/bcryptjs
```
Already configured in this project.

---

## Build & TypeScript Issues

### TypeScript Errors During Build
```bash
# Local check
npx tsc --noEmit

# Common fixes:
# 1. Missing types
npm install --save-dev @types/<package>

# 2. Prisma client not generated
npx prisma generate

# 3. Path alias issues — check tsconfig.json paths
```

### "Module not found" for @/components/...
- Check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`
- Restart TypeScript server (VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server")

### ESLint Errors Blocking Build
```bash
npm run lint          # See errors
npm run lint -- --fix # Auto-fix what's possible

# If 49 warnings are noise:
# Check .eslintrc.json rules — some are warn-only intentionally
```

### Next.js 16 App Router Specific
- `use client` directive required for client components
- Server components cannot use hooks (`useState`, `useEffect`)
- Dynamic routes: `src/app/api/[id]/route.ts` not `src/app/api/:id/route.ts`

---

## Docker Issues

### "Permission denied" on docker-entrypoint.sh
```bash
chmod +x docker-entrypoint.sh
# Rebuild
docker compose --profile build up -d --build
```

### Container Exits Immediately
```bash
docker compose logs app
# Common causes:
# - DATABASE_URL wrong in .env
# - NEXTAUTH_SECRET missing
# - Port 3000 already in use on host
# - Prisma generate failed (check logs)
```

### Database Not Persisting (Docker)
```yaml
# docker-compose.yml must have volumes:
volumes:
  - ./data:/app/data           # SQLite file
  - ./public/uploads:/app/public/uploads  # Images
```
Check: `docker compose exec app ls -la /app/data/`

### Hot Reload Not Working (Dev Profile)
```bash
docker compose --profile dev up -d
# Check:
docker compose --profile dev logs -f app
# Should see: "Ready in XXXms" and webpack compilation on changes
```
Ensure source code is mounted (dev profile does this automatically).

### Image Too Large / Build Slow
- Multi-stage Dockerfile already optimized (~200MB final)
- `.dockerignore` excludes node_modules, .next, .git
- Use `docker compose --profile build` for local production build

---

## Vercel Deployment Issues

### Build Fails: "Prisma Client not found"
```bash
# Build command in vercel.json must include:
npx prisma generate --schema=prisma/schema.vercel.prisma
```
Already configured. Check Vercel build logs for exact error.

### Build Fails: "Can't resolve @prisma/client"
- `postinstall` script runs `prisma generate` automatically
- If skipped, add to build command:
  `prisma generate && next build`

### "Function RUNTIME_ERROR" / "Cannot find module"
- Check `vercel.json` → `functions` config for maxDuration
- Prisma needs `nodejs18.x` or higher (configured in `package.json` engines)

### Environment Variables Not Working
- Set in **Vercel Dashboard → Settings → Environment Variables**
- Must set for **Production**, **Preview**, **Development** separately
- Redeploy after adding: `vercel --prod` or push to main

### Database Connection Fails on Vercel
- Use **Pooled connection string** from Neon/Supabase (port 5432, not 6543)
- Add `?sslmode=require` to connection string
- Set `DATABASE_URL` in Vercel env vars (not `.env`)

### Images Not Loading on Vercel
**Root cause**: Vercel serverless functions have read-only filesystem.
```tsx
// Current: saves to /public/uploads/ — works locally, fails on Vercel
// Fix: Use external storage (Uploadthing, Cloudinary, S3)

// Example with Uploadthing:
import { createUploadthing } from "uploadthing/next";
```
See `src/lib/upload-validation.ts` for validation logic.

---

## POS / Runtime Issues

### "Stok tidak cukup" but Stock Shows Available
- Race condition: concurrent transactions
- Fix: Already handled with atomic `updateMany` + `where: { stock: { gte: qty } }`
- If persists: check `prisma/dev.db` for actual stock values

### Payment Modal Doesn't Open / Calculate Change
- Check browser console for JS errors
- Ensure `PaymentModal` receives correct `total` prop
- Quick-pay buttons: `Uang Pas` = total, `50rb` = 50000, etc.

### Manual Item Not Added to Cart
- `ManualItemModal` returns `{ name, sku, price, quantity }`
- Cart expects `productId: null` for manual items
- Check `useCart` hook in `src/app/(pos)/pos/useCart.ts`

### Barcode Printing Fails / Wrong Size
- Paper sizes: `58mm` (default) or `80mm`
- Configure in Admin → Pengaturan → `receipt_paper_size`
- Thermal printer must support selected width
- Test: `window.print()` from StrukView page

### Dark Mode Not Persisting
- `ThemeToggle` saves to `localStorage.theme`
- Check: `localStorage.getItem('theme')` in DevTools
- Server-side: `ThemeProvider` reads cookie/header for initial render

---

## Testing Issues

### Vitest Tests Fail
```bash
npm test                    # Run all
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage

# Common issues:
# - Tests use Prisma → need test database
# - Mock NextAuth in auth tests
# - Check vitest.config.ts for setupFiles
```

### "PrismaClientKnownRequestError" in Tests
- Tests should use separate database or mock Prisma
- See `src/lib/__tests__/` for mocking patterns

---

## Performance Issues

### Slow Page Loads
- Check `next build` output for large bundles
- Use `next-bundle-analyzer` temporarily:
  ```bash
  npx @next/bundle-analyzer
  ```
- Enable `swcMinify: true` in `next.config.mjs` (default in Next 16)

### Database Queries Slow
- Check indexes in `prisma/schema.prisma` (`@@index`)
- Use `prisma.$queryRaw` for complex queries
- Enable Prisma query logging:
  ```ts
  // prisma.ts
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  ```

### Memory Leaks in Docker
- Node.js `--max-old-space-size` default ~1.4GB
- If OOM: add to Dockerfile:
  ```dockerfile
  ENV NODE_OPTIONS="--max-old-space-size=512"
  ```

---

## CI/CD Issues

### GitHub Actions: Docker Build Fails
- Check `.github/workflows/docker.yml`
- Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` must be set in GitHub repo settings
- GHCR: `GITHUB_TOKEN` is automatic

### CD Workflow: Staging Deploy Fails
```bash
# Check:
# 1. CI (quality) + Docker (build) both passed on main
# 2. GitHub Environment "staging" exists
# 3. Secrets: STAGING_NEXTAUTH_URL, STAGING_NEXTAUTH_SECRET
# 4. Smoke test script passes locally:
node scripts/smoke-test.mjs http://localhost:3001
```

### Smoke Tests Fail
```bash
# Run locally against staging:
./scripts/smoke-test.sh http://staging.yourdomain.com
# Or cross-platform:
node scripts/smoke-test.mjs http://staging.yourdomain.com

# Tests:
# 1. /api/health → status: healthy (retries 10x)
# 2. / → contains "RIZKI MOTOR"
# 3. /login → 200
# 4. /api/products, /api/categories, /api/settings → 200
# 5. /_next/static/... → 200 (CSS/JS)
# 6. HTML has <!DOCTYPE html>
```

---

## Common Error Messages Reference

| Error | Location | Fix |
|-------|----------|-----|
| `P2003: Foreign key constraint failed` | Prisma | Don't delete referenced records; use soft delete |
| `P2002: Unique constraint failed` | Prisma | SKU/username/phone already exists |
| `ECONNREFUSED` | Database | Check host/port, firewall, DATABASE_URL |
| `ENOENT: no such file or directory` | Uploads | Create `public/uploads/` dir, check Docker volume |
| `next-auth: JWT decryption failed` | Auth | NEXTAUTH_SECRET changed — clear cookies, re-login |
| `Hydration mismatch` | Next.js | Server/client render diff — suppress with `suppressHydrationWarning` |
| `Window is not defined` | SSR | Wrap browser-only code in `useEffect` or `typeof window !== 'undefined'` |

---

## Getting Help

1. **Check logs first**:
   - Local: `npm run dev` terminal output
   - Docker: `docker compose logs -f app`
   - Vercel: Dashboard → Functions → View logs

2. **Search existing issues** in GitHub repo

3. **Create minimal reproduction** if filing bug

4. **Key files to inspect**:
   - `.env` — environment config
   - `prisma/schema.prisma` — database schema
   - `next.config.mjs` — Next.js config
   - `vercel.json` — Vercel deployment config
   - `.github/workflows/*.yml` — CI/CD

---

## Useful Commands Cheat Sheet

```bash
# Development
npm run dev                 # Start dev server
npm run db:studio           # Open Prisma Studio (GUI)
npm run lint                # Check code style
npm test                    # Run tests

# Database
npm run db:push             # Push schema changes
npm run db:migrate          # Create migration
npm run db:seed             # Seed default data

# Docker
docker compose up -d                    # Production (pull)
docker compose --profile build up -d    # Production (build)
docker compose --profile dev up -d      # Development (hot reload)
docker compose logs -f app              # View logs
docker compose down                     # Stop

# Production Build
npm run build               # Standard build
npm run vercel:build        # Vercel-specific build
npm run start               # Run production server

# Vercel
vercel                      # Preview deploy
vercel --prod               # Production deploy
vercel logs <deployment-url> # View logs
```