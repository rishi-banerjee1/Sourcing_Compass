# Sourcing Compass
AI-powered talent landscape mapper — describe a role and get target companies, adjacent pools, wildcard bets, and job titles in seconds.

<p align="center">
  <!-- Add screenshots to assets/ once captured -->
</p>

![React](https://img.shields.io/badge/React-18-blue?logo=react) ![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange) ![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-green) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

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

No login. No account. Bring your own Groq API key (free at [console.groq.com](https://console.groq.com)).

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

The AI (Llama 3.3 70B via Groq) processes your inputs and returns a structured talent landscape. Takes 5–10 seconds.

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

You need a free [Groq API key](https://console.groq.com).

```bash
git clone https://github.com/rishi-banerjee1/Sourcing_Compass.git
cd Sourcing_Compass
npm install
cp .env.example .env          # add your VITE_GROQ_API_KEY
npm run dev                   # starts on http://localhost:5173
```

The API key is injected at **build time** via Vite's `import.meta.env`. It is embedded in the browser bundle — do not use a key with billing limits you aren't comfortable exposing client-side. Groq's free tier is suitable for personal use.

### Deploy your own GitHub Pages fork

1. Fork the repo
2. Go to **Settings → Secrets → Actions** and add `VITE_GROQ_API_KEY`
3. Go to **Settings → Pages**, set source to **GitHub Actions**
4. Push to `main` — the workflow deploys automatically

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI | React 18 + Tailwind CSS v4 | Component model, fast iteration |
| Build | Vite 5 | Zero-config, fast HMR |
| AI | Groq (Llama 3.3 70B) | Fast inference, generous free tier |
| Hosting | GitHub Pages via Actions | Zero cost, no server needed |

---

## Contributing

PRs welcome — see [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

For feature changes, open an issue first to align on scope.

## License

MIT
