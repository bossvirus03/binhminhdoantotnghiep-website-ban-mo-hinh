export type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: "user" | "admin";
};

export type Brand = { id: string; name: string };
export type Category = { id: string; name: string };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  brand: Brand;
  category: Category;
  images?: { id: string; url: string }[];
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

export type OrderItem = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  productImage?: string | null;
};

export type Order = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentMethod: "COD" | "BANK_TRANSFER";
  subtotal: number;
  shippingFee: number;
  total: number;
  fullName: string;
  phone: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
};
