import { User } from "./user.interface";

export interface Livreur {
  id: number;
  user_id: number;
  name: string;
  firstname: string;
  tel: string;
  dateNaissance: string; // Format date, ex. 'YYYY-MM-DD'
  typeVehicule: string;
  zoneActivite: string;
  typeContrat: 'temps plein' | 'temps partiel' | 'freelance';
  matricule: string;
  photo: string | null; // URL de la photo
  // Ajoute d'autres champs si nécessaires, comme created_at, updated_at
  user: User; // Référence à l'interface User existante
}

export interface CreateLivreurRequest {
  name: string;
  firstname: string;
  email: string;
  password: string;
  tel: string;
  dateNaissance: string;
  typeVehicule: string;
  zoneActivite: string;
  typeContrat: 'temps plein' | 'temps partiel' | 'freelance';
  matricule: string;
  photo?: File; // Fichier optionnel pour la photo
}

export interface UpdateLivreurRequest {
  name?: string;
  email?: string;
  matricule?: string;
  typeContrat?: 'temps plein' | 'temps partiel' | 'freelance';
  // Ajoute d'autres champs optionnels basés sur le controller update
  // Note: password n'est pas géré dans update ici, mais si besoin, ajoute-le
}