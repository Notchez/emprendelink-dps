import { apiRequest } from './apiClient';

/**
 * Servicio para creación y consulta inicial de pedidos (Cliente)
 * Responsabilidad: Integrante 3
 */
export const orderService = {
  /**
   * Envía un nuevo pedido generado por un cliente invitado
   * @param {Object} orderData
   */
  async createOrder(orderData) {
    try {
      if (typeof apiRequest === 'function') {
        const response = await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });
        if (response && response.success) return response;
      }
      throw new Error('Sin conexión con la API de pedidos');
    } catch (error) {
      // Simulación de respuesta exitosa para desarrollo local
      const mockOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      return {
        success: true,
        data: {
          id: mockOrderId,
          ...orderData,
          createdAt: new Date().toISOString(),
        },
        error: null,
      };
    }
  },
};