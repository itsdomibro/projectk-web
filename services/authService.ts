import api from "./api";
import { LoginDto, RegisterDto, AuthResponseDto } from "../types/auth";

export const authService = {
  async register(data: RegisterDto): Promise<void> {
    console.log(data);
    await api.post("/auth/register", data);
  },

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const res = await api.post("/auth/login", data);
    return res.data;
  },
};
