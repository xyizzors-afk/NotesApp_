"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useOnboarded } from "@/lib/local-hooks";
import { NameModal } from "./name-modal";

interface NameModalContextValue {
  openNameModal: () => void;
}

const NameModalContext = createContext<NameModalContextValue | null>(null);

export function NameModalProvider({ children }: { children: React.ReactNode }) {
  const [onboarded] = useOnboarded();
  const [modalOpen, setModalOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  // Gates the auto-open check until after the first client render, so we
  // never act on a value that might still be the pre-hydration default —
  // acting early was the reason the modal used to force-open on every load.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // First-time visitor: only decide once we're sure `onboarded` reflects
  // the real localStorage value, not the server-render fallback.
  useEffect(() => {
    if (!mounted) return;
    if (!onboarded) {
      setIsOnboarding(true);
      setModalOpen(true);
    }
  }, [mounted, onboarded]);

  const openNameModal = useCallback(() => {
    setIsOnboarding(false);
    setModalOpen(true);
  }, []);

  const close = useCallback(() => setModalOpen(false), []);

  return (
    <NameModalContext.Provider value={{ openNameModal }}>
      {children}
      <NameModal open={modalOpen} onClose={close} isOnboarding={isOnboarding} />
    </NameModalContext.Provider>
  );
}

export function useNameModal(): NameModalContextValue {
  const ctx = useContext(NameModalContext);
  if (!ctx) throw new Error("useNameModal must be used within NameModalProvider");
  return ctx;
}
