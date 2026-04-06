import { GROQ_URL, MODEL } from "./constants.js";

export async function callGroq(apiKey, prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `API error ${res.status}`);
  }

  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
