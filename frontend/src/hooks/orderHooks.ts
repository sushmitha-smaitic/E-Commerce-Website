import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../apiClient";
import { cartItem, shippingAddress } from "../types/Cart";
import { Order } from "../types/Order";

export const useDeleteOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (await apiClient.delete<{ message: string }>(`api/orders/${orderId}`))
        .data,
  });

export const useGetOrderSummaryQuery = () =>
  useQuery({
    queryKey: ["orders-summary"],
    queryFn: async () =>
      (
        await apiClient.get<{
          users: [{ numUsers: number }];
          orders: [{ numOrders: number; totalSales: number }];
          dailyOrders: [];
          productCategories: [];
        }>(`api/orders/summary`)
      ).data,
  });

export const useGetOrderDetailsQuery = (id: string) =>
  useQuery({
    queryKey: ["orders", id],
    queryFn: async () => (await apiClient.get<Order>(`api/orders/${id}`)).data,
  });

export const useGetOrdersQuery = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiClient.get<Order[]>(`api/orders`)).data,
  });

export const useGetOrderHistoryQuery = () =>
  useQuery({
    queryKey: ["order-history"],
    queryFn: async () =>
      (await apiClient.get<Order[]>(`/api/orders/mine`)).data,
  });

export const useGetPaypalClientIdQuery = () =>
  useQuery({
    queryKey: ["paypal-clientId"],
    queryFn: async () =>
      (await apiClient.get<{ clientId: string }>(`/api/keys/paypal`)).data,
  });

export const usePayOrderMutation = () =>
  useMutation({
    mutationFn: async (details: { orderId: string }) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${details.orderId}/pay`,
          details
        )
      ).data,
  });

export const useCreateOrderMutation = () =>
  useMutation({
    mutationFn: async (order: {
      orderItems: cartItem[];
      shippingAddress: shippingAddress;
      paymentMethod: string;
      deliverySpeed: string;
      itemsPrice: number;
      shippingPrice: number;
      taxPrice: number;
      totalPrice: number;
    }) =>
      (
        await apiClient.post<{ message: string; order: Order }>(
          `api/orders`,
          order
        )
      ).data,
  });

export const useDeliverOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${orderId}/deliver`
        )
      ).data,
  });

export const useShippedOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${orderId}/shipped`
        )
      ).data,
  });

export const usePackedOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${orderId}/packed`
        )
      ).data,
  });

export const useReturnOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${orderId}/return`
        )
      ).data,
  });

export const usePickedUpOrderMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.put<{ message: string; order: Order }>(
          `api/orders/${orderId}/return/pickup`
        )
      ).data,
  });

export const useGetStripePublishableKeyQuery = () =>
  useQuery({
    queryKey: ["stripe-publishable-key"],
    enabled: false,
    queryFn: async () =>
      (await apiClient.get<{ key: string }>(`/api/keys/stripe`)).data,
  });

export const useCreateStripePaymentIntentMutation = () =>
  useMutation({
    mutationFn: async (orderId: string) =>
      (
        await apiClient.post<{ clientSecret: string }>(
          `/api/orders/${orderId}/stripe-payment-intent`
        )
      ).data,
  });
