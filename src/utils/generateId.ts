/**
 * Generates a locally-unique ID using timestamp + random suffix.
 * Collision probability is negligible for local user data.
 * Format: base-36 timestamp + 6-char random suffix (e.g. "lq5v4s2xk9ab")
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
