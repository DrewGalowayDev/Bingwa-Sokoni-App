import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ORDER_STATUS } from '../data/constants';

/**
 * Order Store
 * 
 * Manages order state with:
 * - Local persistence (survives refresh)
 * - Offline queue support
 * - Auto-sync capability
 */

export const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      syncInProgress: false,
      lastSyncTime: null,

      // Actions
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders]
        }));
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        }));
      },

      removeOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId)
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        }));
      },

      // Get pending orders (offline queue)
      getPendingOrders: () => {
        return get().orders.filter(o => o.status === ORDER_STATUS.PENDING);
      },

      // Get orders by status
      getOrdersByStatus: (status) => {
        return get().orders.filter(o => o.status === status);
      },

      // Sync pending orders when online
      syncPendingOrders: async () => {
        const pendingOrders = get().getPendingOrders();
        if (pendingOrders.length === 0) return;

        set({ syncInProgress: true });

        try {
          // Process each pending order
          for (const order of pendingOrders) {
            // In production, this would call the actual API
            // For now, simulate processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update to queued status
            get().updateOrder(order.id, { status: ORDER_STATUS.QUEUED });
          }

          set({ 
            syncInProgress: false, 
            lastSyncTime: new Date().toISOString() 
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ syncInProgress: false });
        }
      },

      // Clear all orders
      clearOrders: () => {
        set({ orders: [] });      },

      // Clear all orders (alias for wallet page)
      clearAllOrders: () => {
        set({ orders: [], lastSyncTime: null });      }
    }),
    {
      name: 'bingwa-orders',
      partialize: (state) => ({ 
        orders: state.orders,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

export default useOrderStore;
