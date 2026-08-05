import { api } from "@/lib/api";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export const menuService = {
  getMenu: async (): Promise<MenuItem[]> => {
    const response = await api.get("/menu");
    return response.data;
  },
};
