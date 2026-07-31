# Cutover — Owner Actions (dimeindustries.us)

**Status:** Engineering package ready — **your Vercel + registrar logins required**  
**Live today:** https://dime-industries.vercel.app  
**Target:** https://dimeindustries.us  

Full checklist: [`44-owner-cutover.md`](./44-owner-cutover.md)

---

## Do this now (≈10 minutes)

### 1) Vercel → Domains

1. Open the production project that serves `dime-industries.vercel.app`
2. **Settings → Domains → Add**
3. Add:
   - `dimeindustries.us`
   - `www.dimeindustries.us`
4. Copy the DNS records Vercel displays (use those if they differ from the table below)

### 2) Vercel → Environment Variables (Production)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://dimeindustries.us` |
| `ALLOW_DEMO_AUTH` | *(delete / leave unset)* |
| `ORDERS_PERSISTENCE` | `auto` |
| `DATABASE_URL` | *(production Postgres if not already set)* |

Redeploy after changing `NEXT_PUBLIC_APP_URL` (Deployments → … → Redeploy).

### 3) Registrar DNS (Namecheap / registrar-servers)

Advanced DNS — keep nameservers `dns1.registrar-servers.com` / `dns2.registrar-servers.com`.

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `76.76.21.21` |
| CNAME Record | `www` | `cname.vercel-dns.com` |

Save. Wait until Vercel shows TLS **Valid** for both hostnames.

### 4) Tell engineering / re-run verify

```bash
npm run cutover:verify:once
npm run smoke -- https://dimeindustries.us
```

Or paste here: “DNS published” and we will re-poll.

---

## Already done (engineering)

- [x] Cutover docs refreshed (pricing, COA/Assistant defaults, Rewards local-first)
- [x] `scripts/verify-domain-cutover.mjs` + `npm run cutover:verify`
- [x] Canonical site URL already `https://dimeindustries.us` in code
- [x] Soft-launch Paybis mock allowed; demo auth must stay off in production
