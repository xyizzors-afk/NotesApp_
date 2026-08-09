"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readJSON, writeJSON, removeKey } from "./storage";

/**
 * React state synced with localStorage. Multiple components reading the same
 * key stay in sync (same tab + across tabs via the `storage` event).
 *
 * `useSyncExternalStore` with a stable cached snapshot keeps the reference
 * stable so it never triggers extra re-renders, and `getServerSnapshot`
 * returns the fallback so there are no hydration mismatches.
 */

const snapshots = new Map<string, unknown>();
const subscribers = new Map<string, Set<() => void>>();

function emit(key: string) {
  subscribers.get(key)?.forEach((listener) => listener());
}

function getSnapshotValue<T>(key: string, fallback: T, validate?: (value: unknown) => boolean): T {
  if (snapshots.has(key)) return snapshots.get(key) as T;
  const value = readJSON<unknown>(key, fallback);
  const safe = validate ? (validate(value) ? value : fallback) : value;
  snapshots.set(key, safe);
  return safe as T;
}

export function useLocalState<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => boolean
): [T, (next: T | ((current: T) => T)) => void] {
  const subscribe = useCallback(
    (listener: () => void) => {
      let set = subscribers.get(key);
      if (!set) {
        set = new Set();
        subscribers.set(key, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
        if (set!.size === 0) {
          subscribers.delete(key);
          snapshots.delete(key);
        }
      };
    },
    [key]
  );

  const getSnapshot = useCallback(
    () => getSnapshotValue<T>(key, fallback, validate),
    [key, fallback, validate]
  );

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = getSnapshotValue<T>(key, fallback, validate);
      const value = typeof next === "function" ? (next as (c: T) => T)(current) : next;
      writeJSON(key, value);
      snapshots.set(key, value);
      emit(key);
    },
    [key, fallback, validate]
  );

  return [useSyncExternalStore(subscribe, getSnapshot, () => fallback), setValue];
}

export function useClearableLocalState<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => boolean
): [T, (next: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue] = useLocalState<T>(key, fallback, validate);
  const clear = useCallback(() => {
    removeKey(key);
    snapshots.delete(key);
    emit(key);
  }, [key]);
  return [value, setValue, clear];
}

// Keep snapshots coherent when localStorage changes in another tab.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key) return;
    snapshots.delete(event.key);
    emit(event.key);
  });
}
