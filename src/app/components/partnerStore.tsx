// ──────────────────────────────────────────────
// 파트너(업체) 저장소 (localStorage + 서버 동기화)
// PartnerBusinessesPage.tsx와 PartnerAdminPage.tsx가 동일한 데이터를 참조합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";
import { defaultPartnersData } from "./defaultPartners";

export interface PartnerItem {
  id: string;
  name: string;
  description: string;
  category: string;
  region: string;
  churchName: string;
  ownerName: string; // 관리자용 대표자명
  phone: string;
  address: string;
  hours: string;
  mapUrl: string;
  contactUrl: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "admin_partners";

/** localStorage에서 업체 목록 읽기 */
export function getPartners(): PartnerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: PartnerItem[] = JSON.parse(raw);
      if (stored && stored.length > 0) {
        // sortOrder 기준으로 정렬 후 반환
        return stored.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    }
  } catch {
    /* ignore */
  }
  return [...defaultPartnersData];
}

/** localStorage에 업체 목록 저장 + 서버 동기화 */
export function savePartners(partners: PartnerItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  serverSet(STORAGE_KEY, partners);
}

/** 고유 ID 생성 */
export function generatePartnerId(): string {
  return "partner-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
