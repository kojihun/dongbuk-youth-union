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
    const res = await fetch(`${BASE_URL}/store/${encodeURIComponent(key)}`, {
      headers: headers(),
    });
    const json = await res.json();
    if (json.ok) return json.value;
    console.log(`[dataSync] serverGet error for key "${key}":`, json.error);
    return null;
  } catch (e) {
    console.log(`[dataSync] serverGet network error for key "${key}":`, e);
    return null;
  }
}

/** 서버에 단일 키 저장 (fire-and-forget) */
export function serverSet(key: string, value: any): void {
  fetch(`${BASE_URL}/store/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ value }),
  }).catch((e) => {
    console.log(`[dataSync] serverSet error for key "${key}":`, e);
  });
}

/** 서버에서 여러 키를 한번에 읽기 */
export async function serverBatchGet(keys: string[]): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${BASE_URL}/store/batch-get`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ keys }),
    });
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
          // 서버에 데이터가 있으면 localStorage에 저장
          if (key === "admin_password") {
            // 비밀번호는 문자열 그대로 저장
            localStorage.setItem(key, typeof data[key] === "string" ? data[key] : JSON.stringify(data[key]));
          } else {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
      }
      console.log("[dataSync] Server data loaded into localStorage");
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