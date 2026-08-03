"use client";

import { useEffect, useState } from "react";
import { PWA_SW_PATH } from "@/lib/pwa/cache-policy";

const DISMISS_KEY = "dime_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaClient() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Dev: never register — cache-first `/_next/static` from a prior SW serves
    // stale webpack chunks and surfaces as `Cannot read properties of undefined
    // (reading 'call')` in RootLayout / StorefrontChrome.
    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      void caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith("dime-pwa-")) void caches.delete(key);
        }
      });
      return;
    }

    let cancelled = false;

    navigator.serviceWorker
      .register(PWA_SW_PATH, { scope: "/" })
      .then((registration) => {
        if (cancelled) return;

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateReady(true);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(registration.waiting);
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        // Registration can fail on insecure origins other than localhost — ignore.
      });

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      try {
        if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
      } catch {
        // ignore storage errors
      }
      setDeferred(promptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  async function acceptInstall() {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // ignore
    }
    setDeferred(null);
    setShowInstall(false);
  }

  function dismissInstall() {
    setShowInstall(false);
    setDeferred(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  function applyUpdate() {
    const worker = waitingWorker;
    if (!worker) {
      window.location.reload();
      return;
    }
    const onControllerChange = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    worker.postMessage({ type: "SKIP_WAITING" });
    setUpdateReady(false);
  }

  if (!showInstall && !updateReady) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none"
      role="region"
      aria-label="App install and updates"
    >
      <div className="pointer-events-auto flex w-full max-w-lg flex-col gap-2">
        {updateReady ? (
          <div className="flex items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 shadow-lg">
            <p className="text-[var(--scale-sm)] text-[var(--color-ink)]">A new version of DIME is ready.</p>
            <button type="button" className="btn-primary shrink-0 px-3 py-1.5 text-[var(--scale-xs)]" onClick={applyUpdate}>
              Refresh
            </button>
          </div>
        ) : null}
        {showInstall ? (
          <div className="flex items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 shadow-lg">
            <p className="text-[var(--scale-sm)] text-[var(--color-ink)]">Install DIME for faster access.</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="nav-link px-2 py-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]"
                onClick={dismissInstall}
              >
                Not now
              </button>
              <button type="button" className="btn-primary px-3 py-1.5 text-[var(--scale-xs)]" onClick={acceptInstall}>
                Install
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
