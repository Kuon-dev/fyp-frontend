// src/lib/fetchers/orders.ts

import { toast } from "sonner";
import { showErrorToast } from "../handle-error";
import { z } from "zod";

const backendURL =
  typeof window !== "undefined"
    ? window.ENV.BACKEND_URL
    : process.env.BACKEND_URL;

// Define Zod schemas based on Prisma model and provided schema
const OrderSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().uuid(),
  codeRepoId: z.string().uuid(),
  totalAmount: z.number().positive(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

const CreateOrderSchema = OrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  status: true,
});

const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  totalAmount: z.number().positive().optional(),
});

type OrderData = z.infer<typeof CreateOrderSchema>;
type UpdateOrderData = z.infer<typeof UpdateOrderSchema>;
type OrderResponse = z.infer<typeof OrderSchema>;

/**
 * Create a new order.
 * @param data - The order data.
 * @returns The created order data or null if failed.
 */
export const createOrder = async (
  data: OrderData,
): Promise<OrderResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Order created successfully.");
    return OrderSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get all orders with pagination.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated orders data or null if failed.
 */
export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/orders?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        orders: data.orders.map((order: unknown) => OrderSchema.parse(order)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get an order by ID.
 * @param id - The ID of the order.
 * @returns The order data or null if not found.
 */
export const getOrderById = async (
  id: string,
): Promise<OrderResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/orders/${id}`);
    const data = await response.json();
    if (response.ok) {
      return OrderSchema.parse(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get orders by user ID with pagination.
 * @param userId - The user ID.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated orders data or null if failed.
 */
export const getOrdersByUser = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/users/${userId}/orders?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        orders: data.orders.map((order: unknown) => OrderSchema.parse(order)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Update an order by ID.
 * @param id - The ID of the order.
 * @param data - The updated order data.
 * @returns The updated order data or null if failed.
 */
export const updateOrder = async (
  id: string,
  data: UpdateOrderData,
): Promise<OrderResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Order updated successfully.");
    return OrderSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Soft delete an order by ID.
 * @param id - The ID of the order.
 * @returns The deleted order data or null if failed.
 */
export const deleteOrder = async (
  id: string,
): Promise<OrderResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/orders/${id}`, {
      method: "DELETE",
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Order deleted successfully.");
    return OrderSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get orders by status with pagination.
 * @param status - The status of the orders.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated orders data or null if failed.
 */
export const getOrdersByStatus = async (
  status: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/orders/status/${status}?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        orders: data.orders.map((order: unknown) => OrderSchema.parse(order)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get user orders by status with pagination.
 * @param userId - The user ID.
 * @param status - The status of the orders.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated orders data or null if failed.
 */
export const getUserOrdersByStatus = async (
  userId: string,
  status: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/users/${userId}/orders/status/${status}?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        orders: data.orders.map((order: unknown) => OrderSchema.parse(order)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

type SearchCriteria = {
  userId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
};

/**
 * Search orders based on criteria.
 * @param criteria - The search criteria.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated orders data or null if failed.
 */
export const searchOrders = async (
  criteria: SearchCriteria,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number } | null> => {
  const filteredCriteria = Object.fromEntries(
    Object.entries(criteria).filter(([_, v]) => v != null),
  );
  const queryString = new URLSearchParams(
    filteredCriteria as Record<string, string>,
  ).toString();
  try {
    const response = await fetch(
      `${backendURL}/orders/search?${queryString}&page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        orders: data.orders.map((order: unknown) => OrderSchema.parse(order)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};
