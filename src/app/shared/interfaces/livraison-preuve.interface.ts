export interface LivraisonPreuve {
  id: string;
  livraison_id: string;
  type: 'PHOTO' | 'SIGNATURE' | 'QR';
  file_url: string | null;
  qr_value: string | null;
  created_at: string;
  updated_at: string;
}