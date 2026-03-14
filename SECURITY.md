# Security Policy

## Reporting a Vulnerability

If you find a security issue in Sourcing Compass, **please open a Pull Request** with the fix rather than filing a public issue. This keeps the details private until a patch is merged.

### What to include in your PR

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

### What is out of scope

- The Groq API key is intentionally client-side (embedded at build time via Vite). This is by design for a static, keyless-backend app. If you self-host with a sensitive key, that is your responsibility to manage.
- Rate limiting / abuse of the live demo — the key used there is free-tier and scoped accordingly.

### Response expectations

This is a personal/open-source project. PRs are reviewed on a best-effort basis — typically within a few days. Critical issues will be prioritised.

Thank you for helping keep Sourcing Compass safe.
