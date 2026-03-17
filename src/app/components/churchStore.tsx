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
      // 기본 교회 목록과 병합 (새로 추가된 기본 교회 반영)
      const storedIds = new Set(stored.map((c) => c.id));
      const merged = [
        ...stored,
        ...DEFAULT_CHURCHES.filter((c) => !storedIds.has(c.id)),
      ];
      return merged;
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