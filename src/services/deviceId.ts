import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "spendwise_device_id";

/**
 * Returns a stable, locally-generated device ID.
 * Generated once on first launch and persisted in SecureStore.
 */
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  // Generate a UUID-like random ID without external libraries
  const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}
