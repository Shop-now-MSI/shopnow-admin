export interface User {
  id: number;
  name: string;
  firstname: string;
  email: string;
  // Ajoute d'autres champs si nécessaires, comme role (admin/livreur), created_at, etc.
  // password n'est pas retourné, donc pas inclus ici
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