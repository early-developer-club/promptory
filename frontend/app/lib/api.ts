// frontend/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!BASE) {
  throw new Error("Missing env: NEXT_PUBLIC_API_BASE_URL");
}

function join(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
}

export async function getJSON(path: string, init?: RequestInit) {
  const url = join(BASE!, path);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function getJSONAuth(path: string, token: string, init?: RequestInit) {
  const url = join(BASE!, path);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function delAuth(path: string, token: string) {
  const url = join(BASE!, path);
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
}
