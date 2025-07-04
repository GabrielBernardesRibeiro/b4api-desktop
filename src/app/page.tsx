"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isUpdated, setIsUpdated] = useState(true);
  const [appVersion, setAppVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const checkForUpdate = async () => {
    if (typeof window !== "undefined" && "electronAPI" in window) {
      const res = await window.electronAPI.invoke<{
        available: boolean;
        version: string;
        currentVersion: string;
      }>("check-for-updates");

      setAppVersion(res.currentVersion);
      setIsUpdated(!res.available);

      if (res.available) {
        setLatestVersion(res.version);
      }
    }
  };

  const startUpdate = () => {
    if (typeof window !== "undefined" && "electronAPI" in window) {
      setUpdateError(null);
      setUpdateReady(false);
      window.electronAPI.send("start-update", {});
    }
  };

  const installUpdate = () => {
    if (typeof window !== "undefined" && "electronAPI" in window) {
      window.electronAPI.send("install-update", {});
    }
  };

  useEffect(() => {
    checkForUpdate();

    if (typeof window !== "undefined" && "electronAPI" in window) {
      // Atualização foi baixada
      window.electronAPI.on("update-downloaded", () => {
        setUpdateReady(true);
      });

      // Erro durante atualização
      window.electronAPI.on(
        "update-error",
        (_event: string, message: string) => {
          setUpdateError(message || "Erro desconhecido.");
        }
      );
    }
  }, []);

  return (
    <div className="bg-black grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] ">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image src={"/logo.svg"} width={400} height={400} alt="logo" />
      </main>

      <footer className="row-start-3 flex flex-col gap-[24px] items-center justify-center text-white">
        <p className="text-gray-700 font-medium">B4API - new update</p>

        {latestVersion && latestVersion !== appVersion ? (
          <p>
            <s>{appVersion}</s> → {latestVersion}
          </p>
        ) : (
          appVersion && <p>Versão: {appVersion}</p>
        )}

        {!isUpdated && !updateReady && !updateError && (
          <button
            onClick={startUpdate}
            className="bg-emerald-700 text-white px-4 py-2 rounded-md"
          >
            Atualize seu aplicativo
          </button>
        )}

        {updateReady && (
          <button
            onClick={installUpdate}
            className="bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Reiniciar para atualizar
          </button>
        )}

        {isUpdated && (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            Aplicativo atualizado
          </button>
        )}

        {updateError && (
          <p className="text-red-600 text-sm">Erro: {updateError}</p>
        )}
      </footer>
    </div>
  );
}
