// ──────────────────────────────────────────────
// 대문 페이지 통합 저장소 (localStorage + 서버 동기화)
// 네비게이션 링크 + 소개 문구를 관리합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface NavLinkItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean; // true → <a> 새 탭, false → React Router <Link>
  visible: boolean;
}

export interface IntroData {
  title: string;          // 섹션 제목 (예: "동북시찰청년연합회")
  paragraphs: string[];   // 소개 문단 배열
  align?: "left" | "center" | "right"; // 텍스트 정렬
}

export interface HomeData {
  navLinks: NavLinkItem[];
  intro: IntroData;
}

const STORAGE_KEY = "admin_home";

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  {
    id: "nav-1",
    label: "Affiliated Church",
    url: "/churches",
    isExternal: false,
    visible: true,
  },
  {
    id: "nav-2",
    label: "Contact",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSemrPx-mGpGJSTiK5GR0aIUe1QW83Fs_mZC_mZUxM9cOZMrow/viewform?usp=publish-editor",
    isExternal: true,
    visible: true,
  },
  {
    id: "nav-3",
    label: "Instagram",
    url: "https://www.instagram.com/jeju.youth_dongbook?igsh=ZTA2OHBwczJocWk2",
    isExternal: true,
    visible: true,
  },
  {
    id: "nav-4",
    label: "Band",
    url: "#",
    isExternal: true,
    visible: true,
  },
];

const DEFAULT_INTRO: IntroData = {
  title: "동북시찰청년연합회",
  paragraphs: [
    "동북시찰청년연합회는,\n제주도 동북 지역에 위치한 교회 청년부들이\n연합하여 세워진 공동체입니다.",
    "각 교회의 청년들이 함께 모여 신앙 안에서 교제하고,\n말씀과 섬김을 통해 하나님 나라의 가치를 실천하며,\n지역과 교회를 섬기기 위해 활동하고 있습니다.",
    "서로 다른 교회에 속해 있지만,\n하나의 믿음 안에서 연합하여\n청년들이 신앙과 삶 속에서 함께 성장하고,\n다음 세대를 세워가는 것을 목표로 하고 있습니다.",
  ],
};

export const DEFAULT_HOME: HomeData = {
  navLinks: DEFAULT_NAV_LINKS,
  intro: DEFAULT_INTRO,
};

/** localStorage에서 홈 데이터 읽기 */
export function getHomeData(): HomeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 기존 데이터에 필드가 없으면 기본값 적용
      if (!parsed.navLinks) parsed.navLinks = DEFAULT_NAV_LINKS;
      if (!parsed.intro) parsed.intro = DEFAULT_INTRO;
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return JSON.parse(JSON.stringify(DEFAULT_HOME));
}

/** localStorage에 홈 데이터 저장 + 서버 동기화 */
export function saveHomeData(data: HomeData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  serverSet(STORAGE_KEY, data);
}

/** 고유 ID 생성 */
export function generateNavId(): string {
  return "nav-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}