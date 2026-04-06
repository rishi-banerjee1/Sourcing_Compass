const HISTORY_KEY = "sourcing-compass-history";
const MAX_HISTORY = 10;

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveToHistory(form, mapData) {
  const history = loadHistory();
  const entry = {
    id: Date.now(),
    form,
    mapData,
    timestamp: new Date().toISOString(),
    label: `${form.role}${form.company ? ` @ ${form.company}` : ""}`,
  };
  const updated = [entry, ...history.filter((h) => h.label !== entry.label)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromHistory(id) {
  const history = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}
