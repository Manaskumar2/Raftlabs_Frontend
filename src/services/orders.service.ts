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

export interface PaginatedOrders {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersService = {
  createOrder: async (data: CreateOrderPayload): Promise<Order> => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  
  getOrders: async (phoneNumber?: string, page: number = 1, limit: number = 10, search?: string): Promise<PaginatedOrders> => {
    const params: Record<string, string | number> = { page, limit };
    if (phoneNumber) params.phoneNumber = phoneNumber;
    if (search) params.search = search;
    const response = await api.get("/orders", { params });
    // If backend isn't paginated yet, wrap the array in PaginatedOrders for safety
    if (Array.isArray(response.data)) {
      return { data: response.data, meta: { page: 1, limit: 10, total: response.data.length, totalPages: 1 } };
    }
    return response.data;
  },
  
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: string, phoneNumber: string): Promise<Order> => {
    const response = await api.delete(`/orders/${id}`, { params: { phoneNumber } });
    return response.data;
  },
};
