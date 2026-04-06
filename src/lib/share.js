export function encodeFormToHash(form) {
  const params = new URLSearchParams();
  if (form.role) params.set("role", form.role);
  if (form.company) params.set("company", form.company);
  if (form.location) params.set("location", form.location);
  if (form.seniority) params.set("seniority", form.seniority);
  if (form.skills.length) params.set("skills", form.skills.join(","));
  if (form.industries.length) params.set("industries", form.industries.join(","));
  if (form.exclusions.length) params.set("exclusions", form.exclusions.join(","));
  return `#${params.toString()}`;
}

export function decodeHashToForm() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const role = params.get("role");
  if (!role) return null;

  return {
    role,
    company: params.get("company") || "",
    location: params.get("location") || "",
    seniority: params.get("seniority") || "",
    skills: params.get("skills")?.split(",").filter(Boolean) || [],
    industries: params.get("industries")?.split(",").filter(Boolean) || [],
    exclusions: params.get("exclusions")?.split(",").filter(Boolean) || [],
  };
}
