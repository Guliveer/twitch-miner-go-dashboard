/**
 * Register config for a number input that converts empty / NaN to a safe value.
 * When `fallback` is provided, empty → fallback. Otherwise empty → undefined
 * (stripped on save, so the bot applies its own default).
 */
export function numRegister(fallback?: number) {
  return {
    setValueAs: (v: unknown) => {
      if (v === "" || v === undefined || v === null) {
        return fallback;
      }
      const n = Number(v);
      return Number.isNaN(n) ? (fallback ?? 0) : n;
    },
  };
}
