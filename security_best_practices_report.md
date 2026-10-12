# Security review and remediation

Baseline reviewed: `3a88f0770f84620c52b6eaac77002852ab2182ab`.

The public GitHub Pages bundle exposed the shared Groq key. The frontend now calls a Cloudflare Worker. The Worker holds the credential in a secret binding, verifies Turnstile, validates requests, and limits traffic. The owner chose to reuse the exposed key to restore service. That key remains compromised until it is revoked in Groq and replaced in the Worker's `GROQ_API_KEY` binding.

## Critical

### S1: Shared Groq key published in browser assets

- **Location:** Original `src/lib/constants.js:3` and `.github/workflows/deploy.yml:27-29` at the baseline commit.
- **Evidence:** `import.meta.env.VITE_GROQ_API_KEY` was passed from a GitHub Actions secret into a Vite build. The production JavaScript bundle contained a Groq key.
- **Impact:** Anyone could extract and use the shared credential. Rebuilding the site does not invalidate historical bundles.
- **Fix:** The frontend sends role inputs to `worker/index.js`. The Worker reads `env.GROQ_API_KEY`; no key is included in the Pages build. The obsolete GitHub Actions secret was deleted.
- **Remaining action:** Revoke the reused key in Groq and set a new key in the Cloudflare Worker secret binding. Never send it through GitHub Actions or a `VITE_` variable.

## High

### S2: Anonymous inference had no server-side abuse controls

- **Location:** Original `src/lib/groq.js:3-28` at the baseline commit.
- **Evidence:** The browser called Groq directly with the shared key. There was no application-side request validation, challenge, or rate limit.
- **Impact:** Automated requests could consume the provider quota and make the app unavailable.
- **Fix:** `worker/index.js` verifies a single-use Turnstile token, restricts browser origins, validates input size and shape, and enforces per-IP and overall request limits before calling Groq.
- **Residual risk:** Origin headers can be forged outside browsers. Cloudflare's rate limiting is approximate and local to each location. Monitor provider usage and set provider-side limits where available.

### S3: Vulnerable locked dependencies

- **Location:** Original `package-lock.json` at the baseline commit.
- **Evidence:** `npm audit` reported four high-severity advisories involving Vite, PostCSS, Nano ID, and source-map-js.
- **Impact:** Development and build tooling could be exposed to published vulnerabilities.
- **Fix:** Compatible lockfile updates were applied. `npm audit` reports zero vulnerabilities.

## Additional hardening

- `index.html` provides a Content Security Policy for the static page. GitHub Pages delivers it via a meta tag, which cannot enforce directives such as `frame-ancestors`.
- `SECURITY.md` now directs vulnerability reports to private reporting instead of public pull requests.
- The Worker returns generic provider errors and does not log prompts or credentials.
