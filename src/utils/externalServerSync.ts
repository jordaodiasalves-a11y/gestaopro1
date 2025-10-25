// Sincronização automática com servidor externo
import { externalServer } from '@/api/externalServer';
import { autoBackupManager } from './autoBackup';

class ExternalServerSync {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos em ms

  // Iniciar sincronização automática
  startAutoSync() {
    // Sincronizar imediatamente
    this.performSync();

    // Configurar sincronização periódica
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.SYNC_INTERVAL);

    // Iniciar backup automático
    autoBackupManager.startAutoBackup();

    console.log('Sistema de sincronização iniciado');
  }

  // Parar sincronização
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    autoBackupManager.stopAutoBackup();
    console.log('Sistema de sincronização parado');
  }

  // Realizar sincronização
  async performSync() {
    try {
      console.log('Sincronizando com servidor externo...');
      
      // Sincronizar dados pendentes
      await externalServer.syncPendingData();
      
      // Sincronizar cash_movements
      await this.syncCashMovements();
      
      // Sincronizar marketplace_orders
      await this.syncMarketplaceOrders();
      
      // Sincronizar usuários
      await this.syncUsers();

      console.log('Sincronização concluída');
    } catch (error) {
      console.error('Erro durante sincronização:', error);
    }
  }

  // Sincronizar movimentos de caixa
  private async syncCashMovements() {
    try {
      const local = localStorage.getItem('cash_movements');
      if (!local) return;

      const movements = JSON.parse(local);
      
      // Buscar do servidor
      const serverData = await externalServer.getFromExternalDatabase('cash_movements');
      
      // Mesclar dados (local tem prioridade para novos)
      const merged = this.mergeData(movements, serverData);
      
      // Atualizar local
      localStorage.setItem('cash_movements', JSON.stringify(merged));
      
      // Enviar novos para servidor
      for (const movement of movements) {
        const exists = serverData.find((s: any) => s.id === movement.id);
        if (!exists) {
          await externalServer.saveToExternalDatabase('cash_movements', movement);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar cash_movements:', error);
    }
  }

  // Sincronizar pedidos marketplace
  private async syncMarketplaceOrders() {
    try {
      const local = localStorage.getItem('marketplace_orders');
      if (!local) return;

      const orders = JSON.parse(local);
      
      const serverData = await externalServer.getFromExternalDatabase('marketplace_orders');
      const merged = this.mergeData(orders, serverData);
      
      localStorage.setItem('marketplace_orders', JSON.stringify(merged));
      
      for (const order of orders) {
        const exists = serverData.find((s: any) => s.id === order.id);
        if (!exists) {
          await externalServer.saveToExternalDatabase('marketplace_orders', order);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar marketplace_orders:', error);
    }
  }

  // Sincronizar usuários
  private async syncUsers() {
    try {
      const local = localStorage.getItem('app_users');
      if (!local) return;

      const users = JSON.parse(local);
      
      const serverData = await externalServer.getFromExternalDatabase('users');
      const merged = this.mergeData(users, serverData);
      
      localStorage.setItem('app_users', JSON.stringify(merged));
      
      for (const user of users) {
        const exists = serverData.find((s: any) => s.username === user.username);
        if (!exists && !user.permanent) {
          await externalServer.saveToExternalDatabase('users', user);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar users:', error);
    }
  }

  // Mesclar dados local e servidor
  private mergeData(local: any[], server: any[]): any[] {
    const merged = [...local];
    
    for (const serverItem of server) {
      const exists = merged.find(m => m.id === serverItem.id);
      if (!exists) {
        merged.push(serverItem);
      }
    }
    
    return merged;
  }
}

export const externalServerSync = new ExternalServerSync();
