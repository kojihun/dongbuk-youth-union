// ──────────────────────────────────────────────
// 브랜드 이미지 저장소 (localStorage + 서버 동기화)
// 로고, 엠블럼, QR코드 등 사이트 전역에서 사용되는 브랜드 이미지를 관리합니다.
// ──────────────────────────────────────────────

import { serverSet } from "./dataSync";

export interface BrandImages {
  logo: string;      // 좌측 상단 가로형 로고 (마크)
  emblem: string;    // 원형 엠블럼
  qrCode: string;    // QR 코드
}

const STORAGE_KEY = "admin_brand_images";

const DEFAULT_BRAND: BrandImages = {
  logo: "",
  emblem: "",
  qrCode: "",
};

/** localStorage에서 브랜드 이미지 읽기 */
export function getBrandImages(): BrandImages {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BRAND, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_BRAND };
}

/** localStorage에 브랜드 이미지 저장 + 서버 동기화 */
export function saveBrandImages(images: BrandImages): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  serverSet(STORAGE_KEY, images);
}

export { DEFAULT_BRAND };
