import * as SecureStore from "expo-secure-store";

const GROQ_API_KEY = "groqApiKey";

export const saveGroqApiKey = (key: string): Promise<void> =>
  SecureStore.setItemAsync(GROQ_API_KEY, key);

export const loadGroqApiKey = (): Promise<string | null> =>
  SecureStore.getItemAsync(GROQ_API_KEY);

export const deleteGroqApiKey = (): Promise<void> =>
  SecureStore.deleteItemAsync(GROQ_API_KEY);
