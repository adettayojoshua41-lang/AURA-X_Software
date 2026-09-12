import { useState, useEffect, useCallback } from "react";
import { emitStorageError } from "../utils/storageEvents";

/**
 * Persists a piece of state to localStorage automatically.
 * Falls back to `initialValue` if the key is missing or the stored JSON
 * is corrupted. If a `sanitize` function is given, it also repairs
 * wrong-shape data (e.g. a field that should be an array but isn't,
 * or a record missing a required id) instead of trusting it blindly —
 * malformed localStorage content should never be able to crash the app.
 */
export function useLocalStorage(key, initialValue, sanitize) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return initialValue;
      const parsed = JSON.parse(saved);
      return sanitize ? sanitize(parsed, initialValue) : parsed;
    } catch (err) {
      console.warn(`Could not read localStorage key "${key}", using default.`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Could not write localStorage key "${key}".`, err);
      emitStorageError(key, err);
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

