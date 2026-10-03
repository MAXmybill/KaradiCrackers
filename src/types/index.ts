export interface Cracker {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'COLLECTED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  crackerId?: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
  category?: string;
}
