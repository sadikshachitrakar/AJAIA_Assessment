"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error" | "no-access";

// Browsers cap keepalive request bodies at 64 KB (shared across in-flight requests).
const KEEPALIVE_LIMIT = 60_000;

/**
 * Debounced, serialized autosave of document content.
 * - schedule(html): call on every change; saves `delay` ms after the last one.
 * - Only one PATCH in flight at a time; edits made meanwhile are saved right after.
 * - On failure the unsaved content is kept, status = "error", retry() resends it.
 * - Pending content is flushed when the component unmounts or the page is hidden/closed.
 */
export function useAutosave(url: string, delay = 800) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const pending = useRef<string | null>(null); // latest content not yet sent
  const inFlight = useRef(false);
  const accessLost = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const save = useCallback(
    async function run(): Promise<void> {
      clearTimer();
      if (inFlight.current || pending.current === null) return; // in-flight save re-runs us when done
      const content = pending.current;
      pending.current = null;
      inFlight.current = true;
      setStatus("saving");

      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (res.status === 404 || res.status === 403) {
          // Unshared/deleted (404) or downgraded to viewer (403) while open.
          // Retrying can't help, so stop saving for good.
          accessLost.current = true;
          inFlight.current = false;
          pending.current = null;
          setError(
            res.status === 404
              ? "You no longer have access to this document"
              : "You can only view this document now",
          );
          setStatus("no-access");
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `Save failed (${res.status})`);
        }
        inFlight.current = false;
        setError(null);
        if (pending.current !== null) return run(); // user typed while we were saving
        setStatus("saved");
      } catch (e) {
        inFlight.current = false;
        pending.current ??= content; // keep for retry, unless newer edits already replaced it
        setError(e instanceof Error ? e.message : "Couldn't save");
        setStatus("error");
      }
    },
    [url],
  );

  const schedule = useCallback(
    (content: string) => {
      if (accessLost.current) return;
      pending.current = content;
      setStatus((s) => (s === "error" ? s : "pending")); // keep the error visible until a save succeeds
      clearTimer();
      timer.current = setTimeout(() => void save(), delay);
    },
    [save, delay],
  );

  const retry = useCallback(() => void save(), [save]);

  // Best-effort send that survives navigation/unload.
  const flushOnExit = useCallback(() => {
    clearTimer();
    if (pending.current === null) return;
    const body = JSON.stringify({ content: pending.current });
    pending.current = null;
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: body.length < KEEPALIVE_LIMIT,
    }).catch(() => {});
  }, [url]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushOnExit();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Too big for keepalive, or still in flight: ask the browser to confirm leaving.
      if (inFlight.current || (pending.current !== null && pending.current.length >= KEEPALIVE_LIMIT)) {
        e.preventDefault();
      }
    };
    window.addEventListener("pagehide", flushOnExit); // tab close, reload, hard navigation
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flushOnExit);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
      flushOnExit(); // client-side navigation away from the editor
    };
  }, [flushOnExit]);

  return { status, error, schedule, retry };
}
