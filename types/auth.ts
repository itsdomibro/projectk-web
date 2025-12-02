export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  businessName: string;
  businessDescription?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  email: string;
  role: string;
}
