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
  initializeAuth: () => void;
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
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("email", res.email);
      localStorage.setItem("role", res.role);
    }
  },

  logout: () => {
    set({ email: null, role: null, accessToken: null });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
    }
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("accessToken");
      const email = localStorage.getItem("email");
      const role = localStorage.getItem("role");
      
      if (token && email && role) {
        set({ accessToken: token, email, role });
      }
    }
  },
}));
