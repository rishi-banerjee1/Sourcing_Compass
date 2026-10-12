import { buildPrompt } from "../src/lib/prompt.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "qwen/qwen3.8-27b";
const PRODUCTION_ORIGIN = "https://rishi-banerjee1.github.io";
const MAX_BODY_BYTES = 4096;

async function readLimitedBody(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function reply(body, status = 200, origin = null) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (origin === PRODUCTION_ORIGIN) return origin;
  if (new URL(request.url).hostname === "localhost" && origin === "http://localhost:5173") return origin;
  if (new URL(request.url).hostname === "127.0.0.1" && origin === "http://127.0.0.1:5173") return origin;
  return null;
}

function shortText(value, max = 120) {
  return typeof value === "string" && value.length <= max ? value.trim() : null;
}

function tagList(value) {
  if (!Array.isArray(value) || value.length > 12) return null;
  const tags = value.map((item) => shortText(item, 60));
  return tags.every((item) => item !== null) ? tags : null;
}

function readForm(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const form = {
    role: shortText(value.role),
    company: shortText(value.company),
    location: shortText(value.location),
    seniority: shortText(value.seniority, 40),
    skills: tagList(value.skills),
    industries: tagList(value.industries),
    exclusions: tagList(value.exclusions),
  };
  return form.role && Object.values(form).every((item) => item !== null) ? form : null;
}

function validMap(value) {
  return value && typeof value === "object" &&
    ["companies", "adjacent", "wildcards", "titles"].every((section) =>
      Array.isArray(value[section]) && value[section].length <= 20 &&
      value[section].every((node) =>
        node && typeof node.id === "string" && node.id.length <= 80 &&
        typeof node.label === "string" && node.label.length <= 160 &&
        Array.isArray(node.tags) && node.tags.length <= 20 &&
        node.tags.every((tag) => typeof tag === "string" && tag.length <= 80) &&
        Array.isArray(node.connections) && node.connections.length <= 30 &&
        node.connections.every((id) => typeof id === "string" && id.length <= 80)
      )
    );
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== "/api/map") return reply({ error: "Not found." }, 404);

    const origin = validOrigin(request);
    if (!origin) return reply({ error: "Forbidden." }, 403);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
          Vary: "Origin",
        },
      });
    }
    if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405, origin);
    if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
      return reply({ error: "Expected JSON." }, 415, origin);
    }
    if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES) {
      return reply({ error: "Request is too large." }, 413, origin);
    }

    const raw = await readLimitedBody(request);
    if (raw === null) {
      return reply({ error: "Request is too large." }, 413, origin);
    }
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return reply({ error: "Invalid JSON." }, 400, origin);
    }
    const form = readForm(payload?.form);
    if (!form) return reply({ error: "Invalid role inputs." }, 400, origin);
    if (typeof payload.turnstileToken !== "string" || !payload.turnstileToken || payload.turnstileToken.length > 2048) {
      return reply({ error: "Verification required." }, 400, origin);
    }

    // These limits protect a public, anonymous API. Origin is a browser boundary, not authentication.
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const [visitor, overall] = await Promise.all([
      env.VISITOR_LIMIT.limit({ key: ip }),
      env.OVERALL_LIMIT.limit({ key: "map" }),
    ]);
    if (!visitor.success || !overall.success) {
      return reply({ error: "Too many requests. Try again shortly." }, 429, origin);
    }
    if (!env.GROQ_API_KEY || !env.TURNSTILE_SECRET) {
      return reply({ error: "Service is not configured." }, 503, origin);
    }

    try {
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET,
          response: payload.turnstileToken,
          remoteip: ip,
        }),
      });
      if (!verification.ok) return reply({ error: "Verification unavailable. Try again." }, 502, origin);
      const challenge = await verification.json();
      const expectedHost = new URL(origin).hostname;
      if (!challenge.success || challenge.hostname !== expectedHost || challenge.action !== "generate_map") {
        return reply({ error: "Verification failed. Try again." }, 403, origin);
      }

      const provider = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: buildPrompt(form) }],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });
      if (!provider.ok) {
        const status = provider.status === 429 ? 429 : 502;
        return reply({ error: status === 429 ? "Groq is busy. Try again shortly." : "Generation is unavailable." }, status, origin);
      }
      const data = await provider.json();
      const content = data.choices?.[0]?.message?.content;
      const map = JSON.parse(content?.replace(/```json|```/g, "").trim() || "null");
      if (!validMap(map)) return reply({ error: "The model returned an invalid map. Try again." }, 502, origin);
      return reply(map, 200, origin);
    } catch {
      return reply({ error: "Generation is unavailable. Try again." }, 502, origin);
    }
  },
};
