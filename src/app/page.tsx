"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isUpdated, setIsUpdated] = useState<boolean>(true);
  const [appVersion, setAppVersion] = useState<string>("");

  const checkForUpdate = async () => {
    if (typeof window !== "undefined" && "electronAPI" in window) {
      const res = await window.electronAPI.invoke<{
        available: boolean;
        version: string;
      }>("check-for-updates");
      if (res.available) {
        setIsUpdated(!res.available);
      }

      setAppVersion(res.version);
    }
  };

  const startUpdate = () => {
    if (typeof window !== "undefined" && "electronAPI" in window) {
      window.electronAPI.send("start-update", {});
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image src={"/logo.svg"} width={400} height={400} alt="logo" />
      </main>
      <footer className="row-start-3 flex flex-col gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white"
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          B4API
        </a>
        {appVersion.length > 0 && <p className="text-white">{appVersion}</p>}
        {!isUpdated && (
          <button
            onClick={startUpdate}
            className="text-white bg-emerald-700 px-4 py-2 rounded-md cursor-pointer"
          >
            Atualize seu aplicativo
          </button>
        )}

        {isUpdated && (
          <button className="text-white bg-emerald-700 px-4 py-2 rounded-md cursor-pointer">
            Aplicativo atualizado
          </button>
        )}
      </footer>
    </div>
  );
}
