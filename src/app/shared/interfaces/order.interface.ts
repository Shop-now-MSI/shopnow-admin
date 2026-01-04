// src/app/shared/interfaces/order.interface.ts
// (Ajoute ou mets à jour ce fichier avec les champs exacts du JSON)

import { Livreur } from './livreur.interface';
import { User } from './user.interface';
import { Product } from './product.interface';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantite: number; // Note: 'quantite' comme dans le JSON
  type: string;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface Livraison {
  id: string; // UUID
  order_id: number;
  livreur_id: number;
  status: string;
  raison_echec: string | null;
  commentaire_echec: string | null;
  date_livraison: string | null;
  created_at: string;
  updated_at: string;
  livreur: Livreur;
}

export interface Order {
  id: number;
  date: string;
  livree: boolean;
  client_id: number;
  delivery_status: string;
  address: string;
  country: string;
  region: string;
  city: string;
  zip: string;
  payment_method: string;
  notes: string;
  total: string; 
  created_at: string;
  updated_at: string;
  user: User; // Client
  order_items: OrderItem[]; 
  livraison?: Livraison;
}

export interface AssignLivreurRequest {
  idCommande: number;
  idLivreur: number;
}

export interface UpdateAssignationRequest {
  idLivraison: string;
  idCommande: number;
  idLivreur: number;
}

export interface CancelOrderRequest {
  idCommande: number;
}