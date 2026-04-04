import { useEffect } from "react";

/**
 * 컴포넌트 마운트 시 타이틀 설정.
 * (PWA 아이콘, 메타 태그, 색상 설정 등은 index.html과 public/manifest.json으로 모두 이관되었습니다)
 */
export function PwaHead() {
  useEffect(() => {
    // ── 브라우저 탭 제목 설정 ──
    document.title = "동북시찰청년연합회";
  }, []);

  return null;
}