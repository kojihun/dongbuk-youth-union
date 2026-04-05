// ──────────────────────────────────────────────
// 서버 ↔ localStorage 동기화 유틸리티
// localStorage를 캐시로 사용하고, Supabase KV를 영구 저장소로 사용합니다.
// ──────────────────────────────────────────────

import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c8f2251b`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
});

/** 서버에서 단일 키 읽기 */
export async function serverGet(key: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${BASE_URL}/store/${encodeURIComponent(key)}`, {
      headers: headers(),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.log(`[dataSync] serverGet HTTP ${res.status} for key "${key}"`);
      return null;
    }
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.ok) return json.value;
      console.log(`[dataSync] serverGet error for key "${key}":`, json.error);
      return null;
    } catch {
      console.log(`[dataSync] serverGet parse error for key "${key}"`);
      return null;
    }
  } catch (e) {
    console.log(`[dataSync] serverGet network error for key "${key}":`, e);
    return null;
  }
}

/** 서버에 단일 키 저장 (fire-and-forget) */
export function serverSet(key: string, value: any): void {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  fetch(`${BASE_URL}/store/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ value }),
    signal: controller.signal,
  }).then(() => clearTimeout(timeout)).catch((e) => {
    clearTimeout(timeout);
    console.log(`[dataSync] serverSet error for key "${key}":`, e);
  });
}

/** 서버에서 여러 키를 한번에 읽기 */
export async function serverBatchGet(keys: string[]): Promise<Record<string, any>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(`${BASE_URL}/store/batch-get`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ keys }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const json = await res.json();
    if (json.ok) return json.data;
    console.log("[dataSync] serverBatchGet error:", json.error);
    return {};
  } catch (e) {
    console.log("[dataSync] serverBatchGet network error:", e);
    return {};
  }
}

// ─── 앱 초기화: 서버 데이터를 localStorage에 채우기 ───

const ALL_KEYS = [
  "admin_home",
  "admin_verse",
  "admin_events",
  "admin_projects",
  "admin_churches",
  "admin_password",
  "donation_account",
  "admin_brand_images",
  "admin_popups",
  "admin_partners",
];

let _initPromise: Promise<void> | null = null;

/** 앱 시작 시 서버에서 데이터를 가져와 localStorage에 저장 */
export function initDataFromServer(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const data = await serverBatchGet(ALL_KEYS);
      for (const key of ALL_KEYS) {
        if (data[key] !== undefined && data[key] !== null) {
          const value = data[key];
          if (key === "admin_password") {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }
      console.log("[dataSync] Server batch data loaded into localStorage");
    } catch (e) {
      console.log("[dataSync] initDataFromServer error:", e);
    }
  })();

  return _initPromise;
}

/** 초기화 완료 여부 */
export function isInitialized(): boolean {
  return _initPromise !== null;
}