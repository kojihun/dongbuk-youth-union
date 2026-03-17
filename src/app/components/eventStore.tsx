// ──────────────────────────────────────────────
// 공유 이벤트 저장소 (localStorage + 서버 동기화)
// Desktop.tsx (Upcoming)와 AdminPage.tsx가 동일한 데이터를 참조합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registerUrl: string;
  visible: boolean;
  category: string;
}

const STORAGE_KEY = "admin_events";

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "동북지역 청년부 소모임 운영 OT",
    date: "2026-04-06",
    time: "14:00",
    location: "함덕교회",
    description: "부활절 연합예배",
    registerUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSd1JBkoPdHPLUz-GTMHLhzR1jcUf-YQMV0M8Xm4nRrCi8Qe1Q/viewform",
    visible: true,
    category: "예배",
  },
  {
    id: "2",
    title: "체육대회",
    date: "2026-05-15",
    time: "10:00",
    location: "제주종합운동장",
    description: "봄 체육대회",
    registerUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSd1JBkoPdHPLUz-GTMHLhzR1jcUf-YQMV0M8Xm4nRrCi8Qe1Q/viewform",
    visible: true,
    category: "행사",
  },
  {
    id: "3",
    title: "수련회",
    date: "2026-07-18",
    time: "09:00",
    location: "제주 서귀포 수련원",
    description: "여름 수련회 (1박 2일)",
    registerUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSd1JBkoPdHPLUz-GTMHLhzR1jcUf-YQMV0M8Xm4nRrCi8Qe1Q/viewform",
    visible: true,
    category: "행사",
  },
];

/** localStorage에서 이벤트 목록 읽기 */
export function getEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_EVENTS;
}

/** localStorage에 이벤트 목록 저장 + 서버 동기화 */
export function saveEvents(events: EventItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  serverSet(STORAGE_KEY, events);
}

/** 고유 ID 생성 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export { DEFAULT_EVENTS, STORAGE_KEY };