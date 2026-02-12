export interface Product {
  _id: string;
  name: string;
  brand: string;
  isActive: boolean;
  category?: {
    name: string;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  grandTotal: number;
  status: string;
}
