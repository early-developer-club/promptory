// app/lib/api.ts

// 브라우저에서 읽힐 값이므로 반드시 NEXT_PUBLIC_ 접두사
const RAW = process.env.NEXT_PUBLIC_API_BASE_URL;

function requiredBase() {
  if (!RAW) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }
  // 뒤쪽 슬래시 제거
  return RAW.replace(/\/+$/, '');
}

/** 베이스 URL과 안전하게 합쳐서 절대 URL 반환 */
export function apiUrl(path: string) {
  const base = requiredBase();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** 공통 JSON fetch 유틸 (401/404 등 에러 메시지 포함) */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), { credentials: 'include', ...init });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[${res.status}] ${path} - ${txt || res.statusText || 'Failed'}`);
  }
  return res.json() as Promise<T>;
}

/** (호환) 예전 getJSONAuth 대체용 */
export async function getJSONAuth<T>(path: string, token: string): Promise<T> {
  return fetchJson<T>(path, { headers: { Authorization: `Bearer ${token}` } });
}

/** (호환) 예전 delAuth 대체용 */
export async function delAuth(path: string, token: string): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[${res.status}] ${path} - ${txt || res.statusText || 'Delete failed'}`);
  }
}
