import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";

const origin = "https://rishi-banerjee1.github.io";
const form = {
  role: "Staff Backend Engineer",
  company: "",
  location: "Singapore",
  seniority: "Staff",
  skills: ["Go"],
  industries: [],
  exclusions: [],
};
const map = Object.fromEntries(
  ["companies", "adjacent", "wildcards", "titles"].map((key) =>
    [key, [{ id: `${key}-1`, label: "Example", tags: [], connections: [] }]]
  )
);

function request(payload, requestOrigin = origin) {
  return new Request("https://sourcing-compass-api.example/api/map", {
    method: "POST",
    headers: { Origin: requestOrigin, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function environment(allowed = true) {
  return {
    GROQ_API_KEY: "test-server-secret",
    TURNSTILE_SECRET: "test-verification-secret",
    VISITOR_LIMIT: { limit: async () => ({ success: allowed }) },
    OVERALL_LIMIT: { limit: async () => ({ success: allowed }) },
  };
}

test("rejects other origins and invalid input before calling providers", async () => {
  assert.equal((await worker.fetch(request({ form, turnstileToken: "token" }, "https://example.com"), environment())).status, 403);
  assert.equal((await worker.fetch(request({ form: { ...form, role: "" }, turnstileToken: "token" }), environment())).status, 400);
  assert.equal((await worker.fetch(request({ form: { ...form, role: "x".repeat(5000) }, turnstileToken: "token" }), environment())).status, 413);
  assert.equal((await worker.fetch(request({ form, turnstileToken: "token" }), environment(false))).status, 429);
});

test("verifies visitor before calling Groq and returns a map", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes("siteverify")) {
      return Response.json({ success: true, hostname: "rishi-banerjee1.github.io", action: "generate_map" });
    }
    return Response.json({ choices: [{ message: { content: JSON.stringify(map) } }] });
  };
  try {
    const response = await worker.fetch(request({ form, turnstileToken: "token" }), environment());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), map);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].options.headers.Authorization, "Bearer test-server-secret");
    assert.equal(JSON.parse(calls[1].options.body).model, "qwen/qwen3.8-27b");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a failed challenge without spending Groq capacity", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ success: false });
  };
  try {
    const response = await worker.fetch(request({ form, turnstileToken: "bad-token" }), environment());
    assert.equal(response.status, 403);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
