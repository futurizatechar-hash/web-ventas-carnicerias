export type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: string;
  oldPrice?: string;
  estimatedUnitPrice?: string;
  category: string;
  categoryId?: number;
  stock: boolean;
  image: string;
  isOffer: boolean;
  saleType: "peso" | "unidad" | "ambos";
};

export type CartItem = {
  id: string; // unique cart item id
  productId: number;
  name: string;
  quantity: number;
  unitType: 'peso' | 'unidad';
  price: string; // original string price
  estimatedUnitPrice?: string;
};
