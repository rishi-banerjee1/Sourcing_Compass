const API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8787/api/map"
  : "https://sourcing-compass-api.pcp-024.workers.dev/api/map";

export async function generateMap(form, turnstileToken) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form, turnstileToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}
