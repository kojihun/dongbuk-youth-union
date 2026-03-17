// ──────────────────────────────────────────────
// 공유 성경구절 저장소 (localStorage + 서버 동기화)
// Desktop.tsx (Frame)와 VerseAdminPage.tsx가 동일한 데이터를 참조합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface VerseData {
  verseEn: string;     // 영문 구절 본문 (줄별 배열 대신 \n 구분)
  referenceEn: string; // 영문 출처 (예: "Matthew 18:20")
  verseKo: string;     // 한글 구절 본문
  referenceKo: string; // 한글 출처 (예: "마태복음 18장 20절")
  align: "left" | "center" | "right"; // 텍스트 정렬
}

const STORAGE_KEY = "admin_verse";

const DEFAULT_VERSE: VerseData = {
  verseEn: "For where two or three gather\nin my name,\nthere am I with them",
  referenceEn: "Matthew 18:20",
  verseKo: "두세 사람이 내 이름으로 모인 곳에는 나도 그들 중에 있느니라",
  referenceKo: "마태복음 18장 20절",
  align: "right",
};

/** localStorage에서 성경구절 읽기 */
export function getVerse(): VerseData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 기존 데이터에 align이 없으면 기본값 적용
      if (!parsed.align) parsed.align = "right";
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_VERSE };
}

/** localStorage에 성경구절 저장 + 서버 동기화 */
export function saveVerse(verse: VerseData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(verse));
  serverSet(STORAGE_KEY, verse);
}

export { DEFAULT_VERSE };