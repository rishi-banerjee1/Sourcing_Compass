# Sourcing Compass
AI-powered talent landscape mapper — describe a role and get target companies, adjacent pools, wildcard bets, and job titles in seconds.

<p align="center">
  <!-- Add screenshots to assets/ once captured -->
</p>

![React](https://img.shields.io/badge/React-18-blue?logo=react) ![Groq](https://img.shields.io/badge/Groq-Qwen%203.8%2027B-orange) ![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-green) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Why This Exists

- Recruiters spend hours manually researching where talent comes from before sourcing begins
- Standard ATS/LinkedIn workflows give you job titles, not talent ecosystems
- "Adjacent pools" and "wildcard bets" (e.g. consulting firms, research labs) are invisible without domain knowledge
- One form → AI-generated map replaces a 2-hour desk research session
- Connections between nodes (companies ↔ titles ↔ pools) are visualised on hover — not buried in a spreadsheet

---

## How to Use It

### Live App

Go to **[https://rishi-banerjee1.github.io/Sourcing_Compass/](https://rishi-banerjee1.github.io/Sourcing_Compass/)**

No login or API key is required for visitors. Map generation is protected by Cloudflare Turnstile and request limits.

---

### Step-by-step

#### 1 — Fill in the left panel

| Field | Required | Example | What it does |
|-------|----------|---------|-------------|
| **Role Title** | ✅ Yes | `Staff Backend Engineer` | Core search anchor — the AI reasons from this |
| **Hiring Company** | Optional | `Stripe` | Narrows company peer set to relevant industry |
| **Location** | Optional | `Singapore` | Filters for geo-relevant talent pools |
| **Seniority** | Optional | `Senior / Staff` | Calibrates scope and depth of results |
| **Key Skills** | Optional | `Rust, distributed systems` | Adds skill-specific company/title suggestions |
| **Industries** | Optional | `Fintech, Infrastructure` | Keeps adjacent pools on-target |
| **Exclusions** | Optional | `Google, Meta` | Suppresses companies you don't want to source from |

All comma-separated fields accept free text — type and hit **Enter** or comma to add a tag.

#### 2 — Click Generate Map

The AI (Qwen 3.8 27B via Groq) processes your inputs and returns a structured talent landscape. Generation time varies with provider load.

#### 3 — Read the four sections

| Section | What's in it | How to use it |
|---------|-------------|--------------|
| **Target Companies** | Companies most likely to employ this profile | Start sourcing here first |
| **Adjacent Talent Pools** | Consulting firms, research labs, adjacent verticals | Use for passive candidates who wouldn't show on direct title search |
| **Wildcard Bets** | Non-obvious, high-signal sources | Useful for niche roles or when the obvious pools are exhausted |
| **Target Titles** | Exact and variant job titles with match confidence % | Paste these into LinkedIn/Ashby searches |

Each card shows:
- Company/title name + sub-label
- Hiring stage badge (if applicable)
- Tags (tech stack, industry signals)
- Number of cross-connections to other nodes

#### 4 — Hover to reveal connections

Hover over any card to see **dashed blue lines** connecting it to related nodes across all four sections. Use this to understand which companies map to which titles, or which adjacent pool feeds which company cluster.

#### 5 — Iterate

Refine your inputs — add exclusions, change seniority, narrow industry — and click **Generate Map** again. Each run is independent.

---

## Self-Hosting / Local Dev

The frontend stays on GitHub Pages. A Cloudflare Worker calls Groq using a server-side secret. The browser never receives that secret.

```bash
git clone https://github.com/rishi-banerjee1/Sourcing_Compass.git
cd Sourcing_Compass
npm ci
npm test
npm run build
npm run dev                   # frontend at http://localhost:5173/Sourcing_Compass/
npx wrangler dev              # local API at http://127.0.0.1:8787
```

For local API testing, put `GROQ_API_KEY` and Turnstile's test `TURNSTILE_SECRET` in an ignored `.dev.vars` file. Never commit these values or place them in a `VITE_` variable. The production Worker needs fresh `GROQ_API_KEY` and `TURNSTILE_SECRET` bindings configured with `wrangler secret put`. The frontend's public Worker URL and Turnstile site key are in `src/lib/mapApi.js` and `src/components/Turnstile.jsx`.

The Worker accepts requests from this repository's GitHub Pages origin, verifies Turnstile tokens server-side, validates input size and shape, then applies per-visitor and overall rate limits before calling Groq. Cloudflare's rate-limit counters are approximate and local to each Cloudflare location. Monitor Groq usage and set provider-side spend or usage limits where available.

### Deploy your own GitHub Pages fork

1. Fork the repo and update the allowed origin in `worker/index.js`, the public Worker URL in `src/lib/mapApi.js`, and the Turnstile site key in `src/components/Turnstile.jsx`.
2. Create a Turnstile widget restricted to your GitHub Pages hostname, then set its secret and a fresh Groq key on your Worker with `wrangler secret put`.
3. Deploy the Worker with `npm run deploy:api`.
4. Set **Settings → Pages** to **GitHub Actions** and push to `main`. The frontend workflow builds without secrets.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI | React 18 + Tailwind CSS v4 | Component model, fast iteration |
| Build | Vite 8 | Builds static assets; receives no secrets |
| API | Cloudflare Worker | Server-side Groq secret, Turnstile verification, input and rate limits |
| AI | Groq (Qwen 3.8 27B) | Structured talent map generation |
| Hosting | GitHub Pages via Actions | Static frontend |

---

## Contributing

PRs welcome — see [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

For feature changes, open an issue first to align on scope.

## License

MIT
