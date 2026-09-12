const listeners = new Set();

export function onStorageError(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function emitStorageError(key, error) {
  const quotaExceeded =
    error?.name === "QuotaExceededError" || error?.code === 22 || error?.code === 1014;
  listeners.forEach((cb) => cb({ key, error, quotaExceeded }));
}
