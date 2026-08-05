import { api } from "@/lib/api";

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data; // Usually { access_token: string, user: any }
  },
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};
