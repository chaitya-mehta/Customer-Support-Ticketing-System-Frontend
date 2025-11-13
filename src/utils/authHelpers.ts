export const getUserRole = (): string | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
};
