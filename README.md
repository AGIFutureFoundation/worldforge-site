# WorldForge Earth (worldforge.agifuturefoundation.org)

Static site for **WorldForge** — 41 agentic training worlds on real Earth maps,
with satellite imagery, elevation data, OSM buildings, robot digital twins, and
union trade certification courses. Powered by AGI Corp · Owned by AGI Future
Foundation PBC. Content reviewed from the
[WorldForge-Browser](https://github.com/AGIFutureFoundation/WorldForge-Browser)
repository.

## Deploy
```bash
vercel          # preview deploy
vercel --prod   # production
```
Then add the custom domain (`worldforge.agifuturefoundation.org`) in the
Vercel dashboard (Settings → Domains). DNS is already pointing to Vercel at
Hostinger — it goes live instantly.

## Agent infrastructure
- Mail: `worldforge@agifuturefoundation.org` (catch-all → `x@agifuturefoundation.org`)
- x402 micropayments: implemented in Metropolis-SmartCiti on Monad
- ERC-8004 agent identity with Omega Steward governance

## TODO
- [ ] Fill in the overview video embed
- [ ] Replace `#` placeholders in footer social links with real profile URLs
