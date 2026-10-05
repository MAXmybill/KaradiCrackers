export interface Cracker {
  id: string;
  name: string;
  price: number; // Selling price
  originalPrice?: number; // Actual/MRP price (displayed with strikethrough)
  itemCode?: string; // e.g. #NPK1690
  piecesContent?: string; // e.g. 10Pcs, 5Pcs
  quantity: number;
  isAvailable: boolean;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  showPricing: boolean; // toggle whether unit & row prices are visible to customer
  discountPercentage: number; // e.g. 20 (percent discount on total)
  updatedAt?: string;
}

export type OrderStatus = 'ORDERED' | 'DELIVERED';

export interface OrderItem {
  id?: string;
  crackerId?: string | null;
  name: string;
  price: number;
  originalPrice?: number;
  itemCode?: string;
  piecesContent?: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number; // Final total after discount
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number; // Selling price
  originalPrice?: number; // Actual / Strikethrough price
  itemCode?: string;
  piecesContent?: string;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
  category?: string;
}

