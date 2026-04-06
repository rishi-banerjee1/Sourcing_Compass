export function buildPrompt(form) {
  return `You are a talent intelligence system. Return a structured talent map as JSON only — no markdown, no explanation, no backticks.

Role: ${form.role}
Hiring Company: ${form.company}
Location: ${form.location}
Seniority: ${form.seniority}
Skills: ${form.skills.join(", ")}
Preferred Industries: ${form.industries.join(", ") || "Any"}
Exclusions (do NOT include these): ${form.exclusions.join(", ") || "None"}

Return this exact JSON structure:
{
  "companies": [{
    "id": "c1",
    "label": "Company Name",
    "sub": "Industry · Size",
    "tags": ["tag1", "tag2"],
    "connections": ["w1"],
    "confidence": 85,
    "stage": "Series B",
    "talentDensity": 78,
    "poachability": 65,
    "likelyProfile": "One sentence describing the typical engineer background.",
    "poachabilitySignals": ["[Signal] First reason", "[Confirmed] Second reason"]
  }],
  "adjacent": [{ "id": "a1", "label": "Company Name", "sub": "Why their talent is transferable", "tags": ["tag1"], "connections": ["c1"] }],
  "wildcards": [{ "id": "w1", "label": "Real Company Name", "sub": "Specific reason why their engineers are a surprising but valid match", "tags": ["overlap"], "connections": ["c1", "a1"] }],
  "titles": [{ "id": "t1", "label": "Job Title", "sub": "Common at these orgs", "tags": ["variant"], "connections": [], "confidence": 90 }]
}

Rules:
- 6-8 companies (mix of established AND 3-4 notable startups)
- CRITICAL: Only include real companies that actually exist. Do NOT invent or combine company names.
- NEVER include "${form.company}" in target companies
- adjacent = 4-5 specific COMPANIES (not job titles) whose engineers have transferable skills
- wildcards = 3-4 unconventional companies with surprising talent overlap
- titles = 5-7 target job titles
- confidence = relevance 0-100
- talentDensity = concentration of relevant engineers 0-100
- poachability = likelihood to move 0-100
- poachabilitySignals = exactly 2-3 strings prefixed [Signal] or [Confirmed]
- likelyProfile = 1 sentence max
- stage = one of: Public / Late Stage / Series C+ / Series B / Series A / Seed / Enterprise
- Return ONLY raw valid JSON. No markdown. No backticks.`;
}
