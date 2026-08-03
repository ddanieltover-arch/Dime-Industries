# robots.txt — effective rules snapshot (Section 12)

**Live URL:** https://www.dimeindustries.us/robots.txt  
**Source of truth:** `app/robots.ts` (Next.js MetadataRoute — not a static `public/robots.txt`)

```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /wishlist
Disallow: /login
Disallow: /signup
Disallow: /api
Disallow: /r

User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /wishlist
Disallow: /login
Disallow: /signup
Disallow: /api
Disallow: /r

# Same allow/disallow for: ChatGPT-User, ClaudeBot, anthropic-ai,
# PerplexityBot, Google-Extended

Sitemap: https://www.dimeindustries.us/sitemap.xml
```

**GSC robots.txt Tester:** Owner confirms desired public paths allowed and private paths blocked after Domain property verification.
