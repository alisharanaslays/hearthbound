"use client";

import { useCallback, useEffect, useState } from "react";
import { getLastError, load, reloadFromDisk, save, STORE_EVENT } from "./storage";
import type { Store } from "./types";

export function useStore() {
  const [store, setStore] = useState<Store | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setStore(load());
    const existing = getLastError();
    if (existing) setNotice(existing);

    const onChange = (event: Event) => {
      setStore(load());
      const detail = (event as CustomEvent<{ error?: string }>).detail;
      if (detail?.error) setNotice(detail.error);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "hearthbound.v1") return;
      setStore(reloadFromDisk());
    };

    window.addEventListener(STORE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(STORE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback((fn: (current: Store) => Store) => {
    const next = fn(load());
    const result = save(next);
    setStore(load());
    if (!result.ok && result.message) setNotice(result.message);
    return result;
  }, []);

  return { store, ready: store !== null, update, notice, setNotice };
}
