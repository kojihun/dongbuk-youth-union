// ──────────────────────────────────────────────
// 공유 교회 저장소 (localStorage + 서버 동기화)
// ChurchesPage.tsx와 ChurchAdminPage.tsx가 동일한 데이터를 참조합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface ChurchItem {
  id: number;
  name: string;
  nameEn: string;
  address: string;
  image: string;
  pastor?: string;
  youthLeader?: string;
  phone?: string;
  visible: boolean;
}

const STORAGE_KEY = "admin_churches";

// 기본 교회 데이터 (ChurchesPage에서 주입)
let DEFAULT_CHURCHES: ChurchItem[] = [];

export function setDefaultChurches(churches: ChurchItem[]) {
  DEFAULT_CHURCHES = churches;
}

/** localStorage에서 교회 목록 읽기 */
export function getChurches(): ChurchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: ChurchItem[] = JSON.parse(raw);
      // 저장된 데이터가 존재하면 기본 교회 목록과 병합하지 않고 저장된 상태를 그대로 반환합니다
      // (삭제된 항목이 새로고침 시 다시 살아나는 현상 방지)
      return stored;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_CHURCHES.map((c) => ({ ...c }));
}

/** localStorage에 교회 목록 저장 + 서버 동기화 */
export function saveChurches(churches: ChurchItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(churches));
  serverSet(STORAGE_KEY, churches);
}

/** 고유 ID 생성 */
export function generateChurchId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}