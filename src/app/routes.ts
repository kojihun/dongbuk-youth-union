import { createBrowserRouter } from "react-router";
import Home from "./components/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/projects",
    lazy: () =>
      import("./components/ProjectsPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/churches",
    lazy: () =>
      import("./components/ChurchesPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/contact",
    lazy: () =>
      import("./components/ContactPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin",
    lazy: () =>
      import("./components/AdminPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/churches",
    lazy: () =>
      import("./components/ChurchAdminPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/verse",
    lazy: () =>
      import("./components/VerseAdminPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/home",
    lazy: () =>
      import("./components/HomeAdminPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/admin/projects",
    lazy: () =>
      import("./components/ProjectAdminPage").then((m) => ({
        Component: m.default,
      })),
  },
  {
    path: "/ci",
    lazy: () =>
      import("./components/CiManualPage").then((m) => ({
        Component: m.default,
      })),
  },
]);