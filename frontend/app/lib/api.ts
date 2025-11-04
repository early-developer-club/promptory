// app/lib/api.ts

/**
 * 프론트(브라우저)용 API 유틸.
 * - 프리렌더/빌드(SSR) 단계에서 NEXT_PUBLIC_API_BASE_URL이 비어 있어도
 *   빌드가 깨지지 않도록 상대경로를 반환해 방어한다.
 * - 실제 서버사이드에서 API 호출이 필요하다면, 환경변수를 반드시 설정하거나
 *   서버 전용 유틸을 별도로 사용하세요.
 */

// 호출 시점에 읽어야 환경 차이를 흡수하기 좋다.
function getRawBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
}

/** 안전한 베이스 URL. 없으면 빈 문자열(상대경로 모드) */
function safeBase(): string {
  const raw = getRawBase().trim();
  return raw ? raw.replace(/\/+$/, '') : '';
}

/** 베이스와 안전하게 합쳐서 URL 반환. 베이스 없으면 상대경로 반환 */
export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = safeBase();
  return base ? `${base}${p}` : p; // 프리렌더/빌드 중엔 상대경로 그대로
}

/** 공통 JSON fetch 유틸 */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path);

  // 서버 렌더/빌드 중에 실제 API 호출이 발생하면 환경이 준비되지 않은 경우가 많다.
  // 대부분의 호출은 'use client' 컴포넌트에서만 일어나므로 문제 없지만,
  // SSR에서 꼭 호출해야 한다면 NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.
  if (!safeBase() && typeof window === 'undefined') {
    throw new Error(
      `API base URL is not set during build/SSR. Set NEXT_PUBLIC_API_BASE_URL or avoid server-side fetch for ${path}`
    );
  }

  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`[${res.status}] ${path} - ${txt || res.statusText || 'Failed'}`);
  }
  return res.json() as Promise<T>;
}

/** (호환) 이전 getJSONAuth 대체 */
export async function getJSONAuth<T>(path: string, token: string): Promise<T> {
  return fetchJson<T>(path, { headers: { Authorization: `Bearer ${token}` } });
}

/** (호환) 이전 delAuth 대체 */
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
