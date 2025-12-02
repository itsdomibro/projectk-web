import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { email, role, accessToken, register, login, logout } = useAuthStore();

  return { email, role, accessToken, register, login, logout };
}
