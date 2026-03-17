import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect, useState } from "react";
import { initDataFromServer } from "./components/dataSync";
import { PwaHead } from "./components/PwaHead";

function AppLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDataFromServer().then(() => setReady(true));
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