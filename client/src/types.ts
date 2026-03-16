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
