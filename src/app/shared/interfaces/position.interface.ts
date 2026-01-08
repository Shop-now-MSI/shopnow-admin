export interface Position {
  id: string; 
  livraison_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  captured_at: string;
}