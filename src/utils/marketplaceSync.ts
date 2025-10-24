// Sincronização e validação de pedidos marketplace

export interface MarketplaceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  items: { product: string; quantity: number; location?: string }[];
  status: "pendente" | "separando" | "concluido" | "concluído";
  created_date: string;
  created_at?: string;
  completed_by?: string;
  source?: string;
}

// Inicializar localStorage com estrutura correta
export function initializeMarketplaceStorage() {
  if (!localStorage.getItem('marketplace_orders')) {
    localStorage.setItem('marketplace_orders', '[]');
  }
  
  if (!localStorage.getItem('marketplace_mode')) {
    localStorage.setItem('marketplace_mode', 'teste');
  }
}

// Validar e normalizar pedidos existentes
export function validateAndNormalizeOrders(): MarketplaceOrder[] {
  try {
    const stored = localStorage.getItem('marketplace_orders');
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    if (!Array.isArray(orders)) return [];
    
    // Normalizar cada pedido
    const normalized = orders.map((order: any) => ({
      id: order.id || Date.now().toString(),
      order_number: order.order_number || order.orderNumber || 'SEM-NUMERO',
      customer_name: order.customer_name || order.customerName || 'Cliente',
      items: Array.isArray(order.items) ? order.items : [],
      status: order.status === 'concluído' ? 'concluido' : (order.status || 'pendente'),
      created_date: order.created_date || order.created_at || order.createdAt || new Date().toISOString(),
      created_at: order.created_at || order.created_date || order.createdAt || new Date().toISOString(),
      completed_by: order.completed_by || order.completedBy,
      source: order.source || 'manual'
    }));
    
    // Salvar versão normalizada
    localStorage.setItem('marketplace_orders', JSON.stringify(normalized));
    
    return normalized;
  } catch (error) {
    console.error('Erro ao validar pedidos:', error);
    return [];
  }
}

// Obter pedidos pendentes
export function getPendingOrders(): MarketplaceOrder[] {
  const orders = validateAndNormalizeOrders();
  return orders.filter(o => o.status !== 'concluido' && o.status !== 'concluído');
}

// Obter pedidos concluídos
export function getCompletedOrders(): MarketplaceOrder[] {
  const orders = validateAndNormalizeOrders();
  return orders.filter(o => o.status === 'concluido' || o.status === 'concluído');
}

// Adicionar novo pedido
export function addMarketplaceOrder(order: Omit<MarketplaceOrder, 'id'>): MarketplaceOrder {
  const orders = validateAndNormalizeOrders();
  const now = new Date().toISOString();
  
  const newOrder: MarketplaceOrder = {
    ...order,
    id: Date.now().toString(),
    created_date: now,
    created_at: now
  };
  
  orders.push(newOrder);
  localStorage.setItem('marketplace_orders', JSON.stringify(orders));
  
  return newOrder;
}

// Atualizar status de pedido
export function updateOrderStatus(
  orderId: string, 
  status: MarketplaceOrder['status'], 
  completedBy?: string
): boolean {
  try {
    const orders = validateAndNormalizeOrders();
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, status, completed_by: completedBy || o.completed_by }
        : o
    );
    
    localStorage.setItem('marketplace_orders', JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
}

// Limpar pedidos antigos (opcional)
export function cleanOldOrders(daysOld: number = 30): number {
  const orders = validateAndNormalizeOrders();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const filtered = orders.filter(order => {
    const orderDate = new Date(order.created_date || order.created_at || '');
    return orderDate >= cutoffDate || order.status === 'pendente';
  });
  
  const removed = orders.length - filtered.length;
  localStorage.setItem('marketplace_orders', JSON.stringify(filtered));
  
  return removed;
}

// Obter estatísticas
export function getOrderStats() {
  const orders = validateAndNormalizeOrders();
  const pending = orders.filter(o => o.status === 'pendente').length;
  const inProgress = orders.filter(o => o.status === 'separando').length;
  const completed = orders.filter(o => o.status === 'concluido' || o.status === 'concluído').length;
  
  return {
    total: orders.length,
    pending,
    inProgress,
    completed
  };
}
