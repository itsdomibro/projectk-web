import { create } from "zustand";
import { authService } from "../services/authService";
import { AuthResponseDto, LoginDto, RegisterDto } from "@/types/auth";

interface AuthState {
  email: string | null;
  role: string | null;
  accessToken: string | null;

  register: (data: RegisterDto) => Promise<void>;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  role: null,
  accessToken: null,

  register: async (data: RegisterDto) => {
    await authService.register(data);
  },

  login: async (data: LoginDto) => {
    const res: AuthResponseDto = await authService.login(data);
    set({ email: res.email, role: res.role, accessToken: res.accessToken });
    localStorage.setItem("accessToken", res.accessToken);
  },

  logout: () => {
    set({ email: null, role: null, accessToken: null });
    localStorage.removeItem("accessToken");
  },
}));
