export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  stock: number;
  price: string; // string car "1299.99"
  small_description: string;
  description: string;
  images: string[];
  created_at: string;
  updated_at: string;
}