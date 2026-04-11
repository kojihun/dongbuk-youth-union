// ──────────────────────────────────────────────
// 활동 게시판 저장소 (localStorage + 서버 동기화)
// ActivityBoardPage.tsx 와 ActivityAdminPage.tsx가 동일한 데이터를 참조합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface ActivityItem {
  id: string;
  title: string;
  groupName: string;       // 소모임명
  author: string;          // 작성자
  activityDate: string;    // 활동일시
  activityPlace: string;   // 활동장소
  participants: string;    // 참여인원
  content: string;         // 활동내용 (줄바꿈 \n 구분)
  report: string;          // 결과보고 (줄바꿈 \n 구분)
  photos: string[];        // 활동사진 URL 배열 (여러 장)
  receipts: string[];      // 영수증 파일 URL/Data URI 배열
  receiptNames: string[];  // 영수증 파일명 배열
  visible: boolean;
  isMain?: boolean;        // 메인화면 사진 슬라이더 노출 여부
  createdAt: string;       // ISO 문자열
}

const STORAGE_KEY = "admin_activity";

const DEFAULT_ACTIVITIES: ActivityItem[] = [];

/** localStorage에서 활동 게시판 목록 읽기 */
export function getActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES));
}

/** localStorage에 활동 게시판 목록 저장 + 서버 동기화 */
export function saveActivities(activities: ActivityItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  serverSet(STORAGE_KEY, activities);
}

/** 고유 ID 생성 */
export function generateActivityId(): string {
  return "act-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
