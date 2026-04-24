"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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

type ProductsContextType = {
  products: Product[];
  toggleProductStock: (id: number) => void;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Costillar de Cerdo Premium", description: "Corte fresco y seleccionado ideal para la parrilla.", price: "$8.500", category: "Cerdo", categoryId: 201, stock: true, image: "/1.png", isOffer: false, saleType: "peso" },
    { id: 2, name: "Chorizo Puro Cerdo", description: "Elaboración propia con receta tradicional de la casa.", price: "$6.200", estimatedUnitPrice: "$1.200", category: "Embutidos", categoryId: 401, stock: true, image: "/2.png", isOffer: false, saleType: "ambos" },
    { id: 3, name: "Matambre de Ternera", description: "Tierno y con el punto justo de grasa.", price: "$9.800", category: "Vacuno", categoryId: 1, stock: false, image: "/3.png", isOffer: false, saleType: "peso" },
    { id: 4, name: "Pechugas de Pollo", description: "Fileteadas o enteras, calidad garantizada.", price: "$4.500", category: "Aves", categoryId: 3, stock: true, image: "/4.png", isOffer: false, saleType: "unidad" },
    { id: 5, name: "Bondiola de Cerdo", description: "Corte jugoso especial para braseado o cocción lenta.", price: "$7.900", category: "Cerdo", categoryId: 2, stock: true, image: "/5.png", isOffer: false, saleType: "peso" },
    { id: 6, name: "Morcilla Casera", description: "Con nuez y pasas, sabor inigualable.", price: "$5.100", estimatedUnitPrice: "$1.100", category: "Embutidos", categoryId: 401, stock: true, image: "/2.png", isOffer: false, saleType: "ambos" },
    { id: 7, name: "Asado de Tira", description: "Corte tradicional para el asado del domingo.", price: "$11.000", category: "Vacuno", categoryId: 101, stock: true, image: "/1.png", isOffer: false, saleType: "peso" },
    { id: 8, name: "Bife de Chorizo Fino", description: "Corte magro y tierno, calidad premium.", price: "$14.500", category: "Vacuno", categoryId: 1011, stock: true, image: "/3.png", isOffer: false, saleType: "peso" },
    { id: 101, name: "Asado Especial", description: "Corte premium con excelente marmoleo en tira.", price: "$12.000", oldPrice: "$15.000", category: "Vacuno", categoryId: 101, stock: true, image: "/1.png", isOffer: true, saleType: "peso" },
    { id: 102, name: "Promo Parrillada", description: "Chorizo, morcilla, asado y vacío para 4 personas.", price: "$25.000", oldPrice: "$30.000", category: "Especiales", categoryId: 102, stock: true, image: "/3.png", isOffer: true, saleType: "unidad" },
    { id: 103, name: "Milanesas de Pollo", description: "Rebozadas frescas, listas para freír o al horno.", price: "$4.000", oldPrice: "$5.500", category: "Aves", categoryId: 3, stock: true, image: "/4.png", isOffer: true, saleType: "peso" }
  ]);

  const toggleProductStock = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: !p.stock } : p));
  };

  return (
    <ProductsContext.Provider value={{ products, toggleProductStock }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
