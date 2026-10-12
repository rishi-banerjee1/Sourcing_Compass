# Security Policy

## Reporting a Vulnerability

If you find a security issue in Sourcing Compass, use GitHub's private vulnerability reporting if it is enabled for this repository. Do not include exploit details or credentials in a public issue or pull request.

### What to include in a private report

- A clear description of the vulnerability and its impact
- Steps to reproduce or a minimal proof of concept
- Your proposed fix
- Any relevant references (CVE, OWASP category, etc.)

### What counts as a security issue

| Category | Examples |
|----------|---------|
| **API key exposure** | Key leaking via logs, error messages, or network responses |
| **XSS / injection** | User-supplied input rendered as unescaped HTML |
| **Supply chain** | Malicious dependency, compromised build action |
| **Data exposure** | Groq responses containing unintended sensitive data |
| **Auth bypass** | If auth is added in future — any way to skip it |

### Deployment boundary

- The frontend is public. It sends role inputs and a Turnstile token to a Cloudflare Worker. Groq and Turnstile secrets belong only in Worker secret bindings.
- Vite exposes `VITE_` variables in browser bundles. Never put credentials in them or in GitHub Pages build secrets.
- Origin checks are a browser boundary, not authentication. The Worker also validates Turnstile tokens and limits requests. A public anonymous API still needs usage monitoring and provider-side limits.
- The old Groq key was included in historical public bundles. It must be revoked in the Groq console; redeployment cannot invalidate it.

### Response expectations

This is a personal/open-source project. PRs are reviewed on a best-effort basis — typically within a few days. Critical issues will be prioritised.

Thank you for helping keep Sourcing Compass safe.
