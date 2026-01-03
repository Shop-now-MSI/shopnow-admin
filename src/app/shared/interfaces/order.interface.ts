import { User } from './user.interface'; // Importe depuis l'interface User existante
//import { Product } from './product.interface'; 

// Interface basique pour Product (si pas déjà défini)
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  // Ajoute d'autres champs comme description, image, etc.
}

export interface Livraison {
  id: number | string; // UUID ? Utilise string si c'est UUID, sinon number
  order_id: number;
  livreur_id: number;
  status: string; // ex. 'en cours'
  date_livraison: string | null;
  livreur: { user: User };
  // Ajoute positions, preuves si chargées
}

export interface Order {
  id: number;
  date: string;
  livree: boolean;
  client_id: number;
  delivery_status: 'en attente' | 'en cours' | 'livré' | 'annulé';
  address: string;
  country: string;
  region: string;
  city: string;
  zip: string;
  payment_method: 'carte' | 'paypal' | 'virement';
  notes: string;
  total: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    firstname: string;
    email: string;
    email_verified_at: null | string;
    type: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  order_items: Array<{
    id: number;
    order_id: number;
    product_id: number;
    quantite: number;
    type: string;
    created_at: string;
    updated_at: string;
    product: {
      id: number;
      name: string;
      brand: string;
      category: string;
      sub_category: string;
      stock: number;
      price: string;
      small_description: string;
      description: string;
      images: string[] | null;
      created_at: string;
      updated_at: string;
    };
  }>;
  livraison: null | any; // Remplacez 'any' par une interface spécifique si vous avez des détails sur la structure de 'livraison'
}

export interface AssignLivreurRequest {
  idCommande: number;
  idLivreur: number;
}

export interface UpdateAssignationRequest {
  idLivraison: number | string;
  idCommande: number;
  idLivreur: number;
}

export interface CancelOrderRequest {
  idCommande: number;
}