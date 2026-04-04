import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect, useState } from "react";
import { initDataFromServer } from "./components/dataSync";
import { PwaHead } from "./components/PwaHead";

function AppLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 이미 로컬 저장소에 데이터가 있는지 확인해서 빠른 진입 허용
    const hasCache = !!localStorage.getItem("admin_projects");
    if (hasCache) {
      setReady(true);
      initDataFromServer(); // 백그라운드 갱신
    } else {
      initDataFromServer().then(() => setReady(true));
    }
  }, []);

  if (!ready) {
    return (
      <>
        <PwaHead />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-800" />
        </div>
      </>
    );
  }

  return (
    <>
      <PwaHead />
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return <AppLoader />;
}