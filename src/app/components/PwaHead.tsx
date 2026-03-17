import { useEffect } from "react";
import { getBrandImages } from "./brandStore";

/**
 * PWA 설정을 동적으로 <head>에 삽입합니다.
 * 헤더 로고를 사용하여 아이콘을 생성합니다.
 * iOS Safari "홈 화면에 추가", Android Chrome "앱 설치" 모두 지원.
 */
export function PwaHead() {
  useEffect(() => {
    // ── 브라우저 탭 제목 설정 ──
    document.title = "동북시찰청년연합회";

    // 이미 초기화했으면 스킵
    if (document.querySelector('link[rel="manifest"]')) return;

    // ── theme-color ──
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#4a6741";
    document.head.appendChild(theme);

    // ── iOS Safari meta ──
    const iosMetas: [string, string][] = [
      ["apple-mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-status-bar-style", "default"],
      ["apple-mobile-web-app-title", "동북시찰청년연합회"],
    ];
    iosMetas.forEach(([name, content]) => {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // ── 로고 이미지를 로드하여 아이콘 생성 ──
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const icon192 = generateIconWithLogo(img, 192);
      const icon512 = generateIconWithLogo(img, 512);
      const icon180 = generateIconWithLogo(img, 180);

      // manifest 동적 생성
      const manifest = {
        name: "동북시찰청년연합회",
        short_name: "동북시찰청년연합회",
        description: "동북시찰청년연합회 대한예수교장로회(통합)",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4a6741",
        orientation: "portrait",
        icons: [
          {
            src: icon192,
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: icon512,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest)], {
        type: "application/json",
      });
      const manifestUrl = URL.createObjectURL(blob);

      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);

      // apple-touch-icon
      const appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      appleIcon.setAttribute("sizes", "180x180");
      appleIcon.href = icon180;
      document.head.appendChild(appleIcon);

      // favicon
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.setAttribute("sizes", "192x192");
      favicon.href = icon192;
      document.head.appendChild(favicon);
    };

    // 이미지 로드 실패 시 텍스트 기반 폴백
    img.onerror = () => {
      const icon192 = generateTextFallbackIcon(192);
      const icon512 = generateTextFallbackIcon(512);
      const icon180 = generateTextFallbackIcon(180);

      const manifest = {
        name: "동북시찰청년연합회",
        short_name: "동북시찰청년연합회",
        description: "동북시찰청년연합회 대한예수교장로회(통합)",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4a6741",
        orientation: "portrait",
        icons: [
          { src: icon192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: icon512, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = URL.createObjectURL(blob);
      document.head.appendChild(manifestLink);

      const appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      appleIcon.setAttribute("sizes", "180x180");
      appleIcon.href = icon180;
      document.head.appendChild(appleIcon);

      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.setAttribute("sizes", "192x192");
      favicon.href = icon192;
      document.head.appendChild(favicon);
    };

    const logoSrc = getBrandImages().logo;
    if (!logoSrc) {
      // 로고가 없으면 텍스트 폴백 사용
      img.onerror?.(new Event("error") as any);
      return;
    }
    img.src = logoSrc;
  }, []);

  return null;
}

/**
 * 헤더 로고(파란색 마크)만 사용하여 앱 아이콘 생성
 * - 흰색 배경에 로고를 중앙 배치 (여백 적당히)
 */
function generateIconWithLogo(logoImg: HTMLImageElement, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 흰색 배경
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // 로고 이미지를 정중앙에 배치 (사이즈의 70% 크기)
  const logoSize = size * 0.7;
  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

  return canvas.toDataURL("image/png");
}

/**
 * 폴백: 텍스트 기반 아이콘
 */
function generateTextFallbackIcon(size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#4a6741";
  ctx.fillRect(0, 0, size, size);

  // 십자가
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.12);
  ctx.lineTo(size * 0.5, size * 0.42);
  ctx.moveTo(size * 0.36, size * 0.25);
  ctx.lineTo(size * 0.64, size * 0.25);
  ctx.stroke();

  const mainSize = Math.round(size * 0.28);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${mainSize}px 'Noto Sans KR', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("동북", size * 0.5, size * 0.56);

  const subSize = Math.round(size * 0.13);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `400 ${subSize}px 'Noto Sans KR', sans-serif`;
  ctx.fillText("청년", size * 0.5, size * 0.79);

  return canvas.toDataURL("image/png");
}