// ──────────────────────────────────────────────
// 관리자 비밀번호 저장소 (localStorage + 서버 동기화)
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

const STORAGE_KEY = "admin_password";
const DEFAULT_PASSWORD = "1111";

/** 현재 비밀번호 가져오기 */
export function getPassword(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_PASSWORD;
}

/** 비밀번호 저장 + 서버 동기화 */
export function savePassword(pw: string): void {
  localStorage.setItem(STORAGE_KEY, pw);
  serverSet(STORAGE_KEY, pw);
}

/** 비밀번호 검증 */
export function verifyPassword(input: string): boolean {
  return input === getPassword();
}