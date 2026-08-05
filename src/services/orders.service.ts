import { api } from "@/lib/api";

export interface OrderItemPayload {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  deliveryAddress: string;
  phoneNumber: string;
  idempotencyKey?: string;
  items: OrderItemPayload[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  menuItem?: {
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  deliveryAddress: string;
  phoneNumber: string;
  status: "ORDER_RECEIVED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export const ordersService = {
  createOrder: async (data: CreateOrderPayload): Promise<Order> => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  
  getOrders: async (phoneNumber?: string): Promise<Order[]> => {
    const params = phoneNumber ? { phoneNumber } : {};
    const response = await api.get("/orders", { params });
    // The backend paginated endpoint returns { data: [...], meta: {...} }
    return response.data.data || response.data;
  },
  
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};
