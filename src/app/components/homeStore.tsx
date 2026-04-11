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
  fontSize?: string;      // 글자 크기 (예: "15px")
  letterSpacing?: string; // 자간 (예: "-0.4px")
  titleFontSize?: string; // 제목 글자 크기 (예: "28px")
  titleLetterSpacing?: string; // 제목 자간 (예: "-0.6px")
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
    id: "nav-6",
    label: "Activity History",
    url: "/history",
    isExternal: false,
    visible: true,
  },
  {
    id: "nav-5",
    label: "Activity Board",
    url: "/activity",
    isExternal: false,
    visible: true,
  },
  {
    id: "nav-7",
    label: "Community Businesses",
    url: "/partners",
    isExternal: false,
    visible: true,
  },
  {
    id: "nav-2",
    label: "Contact",
    url: "/contact",
    isExternal: false,
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
  fontSize: "15px",
  letterSpacing: "-0.4px",
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

      // 마이그레이션: "Contact" 링크를 내부 /contact 로 변경 및 "함께하는 업체" 추가
      if (parsed.navLinks) {
        let migrated = false;
        parsed.navLinks = parsed.navLinks.map((link: NavLinkItem) => {
          if (link.label === "소속교회") {
            migrated = true;
            link.label = "Affiliated Church";
          }
          if (link.label === "Contact" && link.isExternal) {
            migrated = true;
            link.url = "/contact";
            link.isExternal = false;
          }
          if (link.url === "/partners") {
            if (link.label !== "Community Businesses") {
              migrated = true;
              link.label = "Community Businesses";
            }
          }
          // "활동 게시판" → "Activity Board" 마이그레이션
          if (link.url === "/activity" && link.label === "활동 게시판") {
            migrated = true;
            link.label = "Activity Board";
          }
          return link;
        });

        // "함께하는 업체"가 없으면 추가
        if (!parsed.navLinks.some((l: NavLinkItem) => l.url === "/partners")) {
          migrated = true;
          const insertIdx = parsed.navLinks.findIndex((l: NavLinkItem) => l.url.includes("instagram"));
          const partnerLink: NavLinkItem = {
            id: generateNavId(),
            label: "Community Businesses",
            url: "/partners",
            isExternal: false,
            visible: true,
          };

          if (insertIdx !== -1) {
            parsed.navLinks.splice(insertIdx, 0, partnerLink);
          } else {
            parsed.navLinks.push(partnerLink);
          }
        }

        // "Activity Board" 링크가 없으면 Community Businesses 바로 뒤에 추가
        if (!parsed.navLinks.some((l: NavLinkItem) => l.url === "/activity")) {
          migrated = true;
          const partnerIdx = parsed.navLinks.findIndex((l: NavLinkItem) => l.url === "/partners");
          const activityLink: NavLinkItem = {
            id: generateNavId(),
            label: "Activity Board",
            url: "/activity",
            isExternal: false,
            visible: true,
          };
          if (partnerIdx !== -1) {
            parsed.navLinks.splice(partnerIdx + 1, 0, activityLink);
          } else {
            parsed.navLinks.push(activityLink);
          }
        }

        // "Activity History" 링크가 없으면 Activity Board 바로 뒤에 추가
        if (!parsed.navLinks.some((l: NavLinkItem) => l.url === "/history")) {
          migrated = true;
          const activityBoardIdx = parsed.navLinks.findIndex((l: NavLinkItem) => l.url === "/activity");
          const historyLink: NavLinkItem = {
            id: generateNavId(),
            label: "Activity History",
            url: "/history",
            isExternal: false,
            visible: true,
          };
          if (activityBoardIdx !== -1) {
            parsed.navLinks.splice(activityBoardIdx + 1, 0, historyLink);
          } else {
            parsed.navLinks.push(historyLink);
          }
        }

        // 지정된 순서대로 정렬 마이그레이션
        const targetOrder = [
          "Affiliated Church",
          "Activity History",
          "Activity Board",
          "Community Businesses",
          "Contact",
          "Instagram",
          "Band"
        ];
        
        parsed.navLinks.sort((a: NavLinkItem, b: NavLinkItem) => {
          let aIdx = targetOrder.indexOf(a.label);
          let bIdx = targetOrder.indexOf(b.label);
          if (aIdx === -1) aIdx = 999;
          if (bIdx === -1) bIdx = 999;
          return aIdx - bIdx;
        });

        // 사용자가 순서를 강제로 바꿨더라도 한번은 순서를 맞춰주기 위한 플래그 (마이그레이션 저장용)
        migrated = true;

        if (migrated) {
          // 백그라운드에서 변경된 데이터를 다시 저장
          setTimeout(() => saveHomeData(parsed), 0);
        }
      }

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