export function normalizeListInput(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined) return undefined;
  if (Array.isArray(input)) return input.map(s => String(s).trim()).filter(Boolean);
  if (typeof input !== 'string') return undefined;
  const raw = input.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
    // if not array, fall through
  } catch {
    // ignore
  }
  // split by newline or comma
  return raw.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
}
