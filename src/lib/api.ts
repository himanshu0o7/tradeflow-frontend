const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function apiFetch(path: string) {
  if (!API_BASE) throw new Error("API base not configured");

  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}