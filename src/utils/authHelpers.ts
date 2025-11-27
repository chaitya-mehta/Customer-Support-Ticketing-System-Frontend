import type { Role } from "../types";
import { STORAGE_KEYS } from "../constants";

export const getUserRole = (): Role | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
};
