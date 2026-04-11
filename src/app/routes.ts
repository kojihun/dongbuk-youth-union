import { createBrowserRouter } from "react-router";
import Home from "./components/Home";

// 동적 모듈 로드 실패 (새 배포 후 해시 불일치 등) 시 페이지를 새로고침하는 래퍼 함수
const lazyWithRetry = <T,>(componentImport: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const hasRetried = window.sessionStorage.getItem("chunk-retry");
    componentImport()
      .then((component) => {
        window.sessionStorage.removeItem("chunk-retry");
        resolve(component);
      })
      .catch((error) => {
        if (!hasRetried) {
          window.sessionStorage.setItem("chunk-retry", "true");
          window.location.reload();
        } else {
          reject(error);
        }
      });
  });
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/projects",
    lazy: () =>
      lazyWithRetry(() => import("./components/ProjectsPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/history",
    lazy: () =>
      lazyWithRetry(() => import("./components/ProjectsPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/churches",
    lazy: () =>
      lazyWithRetry(() => import("./components/ChurchesPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/contact",
    lazy: () =>
      lazyWithRetry(() => import("./components/ContactPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin",
    lazy: () =>
      lazyWithRetry(() => import("./components/AdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/churches",
    lazy: () =>
      lazyWithRetry(() => import("./components/ChurchAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/verse",
    lazy: () =>
      lazyWithRetry(() => import("./components/VerseAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/home",
    lazy: () =>
      lazyWithRetry(() => import("./components/HomeAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/projects",
    lazy: () =>
      lazyWithRetry(() => import("./components/ProjectAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/contact",
    lazy: () =>
      lazyWithRetry(() => import("./components/ContactAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/partners",
    lazy: () =>
      lazyWithRetry(() => import("./components/PartnerBusinessesPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/partners",
    lazy: () =>
      lazyWithRetry(() => import("./components/PartnerAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/ci",
    lazy: () =>
      lazyWithRetry(() => import("./components/CiManualPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/activity",
    lazy: () =>
      lazyWithRetry(() => import("./components/ActivityBoardPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/activity/:id",
    lazy: () =>
      lazyWithRetry(() => import("./components/ActivityBoardPage")).then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/activity",
    lazy: () =>
      lazyWithRetry(() => import("./components/ActivityAdminPage")).then((m) => ({
        Component: m.default,
      })),
  },
]);