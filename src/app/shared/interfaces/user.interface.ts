export interface User {
  id: number;
  name: string;
  firstname: string;
  email: string;
  type: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  firstname?: string;
  email?: string;
  password?: string;
}