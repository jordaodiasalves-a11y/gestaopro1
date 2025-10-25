// Sistema de backup automático diário
import { externalServer } from '@/api/externalServer';

class AutoBackupManager {
  private backupInterval: NodeJS.Timeout | null = null;
  private readonly BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas em ms

  // Iniciar backup automático
  startAutoBackup() {
    // Verificar se já existe um backup hoje
    const lastBackup = localStorage.getItem('last_backup_date');
    const today = new Date().toISOString().split('T')[0];

    if (lastBackup !== today) {
      this.performBackup();
    }

    // Configurar backup diário
    this.backupInterval = setInterval(() => {
      this.performBackup();
    }, this.BACKUP_INTERVAL);

    console.log('Sistema de backup automático iniciado');
  }

  // Parar backup automático
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('Sistema de backup automático parado');
    }
  }

  // Realizar backup
  async performBackup() {
    try {
      console.log('Iniciando backup automático...');
      
      const timestamp = new Date().toISOString().split('T')[0];
      const backupData = this.collectBackupData();

      // Tentar salvar no servidor externo
      try {
        await externalServer.createBackup();
        console.log('Backup salvo no servidor externo');
      } catch (serverError) {
        console.warn('Erro ao salvar no servidor, salvando localmente:', serverError);
        // Fallback: salvar localmente
        this.saveLocalBackup(timestamp, backupData);
      }

      // Atualizar data do último backup
      localStorage.setItem('last_backup_date', timestamp);
      
      // Limpar backups antigos (manter últimos 7 dias)
      this.cleanOldBackups();

      console.log('Backup concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao realizar backup:', error);
    }
  }

  // Coletar dados para backup
  private collectBackupData() {
    return {
      timestamp: new Date().toISOString(),
      data: {
        users: this.getLocalStorageItem('app_users'),
        cash_movements: this.getLocalStorageItem('cash_movements'),
        marketplace_orders: this.getLocalStorageItem('marketplace_orders'),
        products_meta: this.getLocalStorageItem('products_meta'),
        settings: {
          alert_mode: localStorage.getItem('alert_mode'),
          alert_interval_minutes: localStorage.getItem('alert_interval_minutes'),
          marketplace_mode: localStorage.getItem('marketplace_mode'),
          preferred_alert_manual_audio: localStorage.getItem('preferred_alert_manual_audio'),
        },
        custom_audios: this.getCustomAudios(),
      }
    };
  }

  // Obter item do localStorage de forma segura
  private getLocalStorageItem(key: string) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return localStorage.getItem(key);
    }
  }

  // Obter áudios customizados
  private getCustomAudios() {
    const audios: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('manual_audio_')) {
        audios[key] = localStorage.getItem(key) || '';
      }
    }
    return audios;
  }

  // Salvar backup localmente
  private saveLocalBackup(timestamp: string, data: any) {
    const backupKey = `backup_${timestamp}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // Registrar backup na lista
    const backupList = this.getLocalStorageItem('backup_list') || [];
    if (!backupList.includes(timestamp)) {
      backupList.push(timestamp);
      localStorage.setItem('backup_list', JSON.stringify(backupList));
    }
  }

  // Limpar backups antigos
  private cleanOldBackups() {
    const backupList = this.getLocalStorageItem('backup_list') || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const oldBackups = backupList.filter((timestamp: string) => {
      const backupDate = new Date(timestamp);
      return backupDate < sevenDaysAgo;
    });

    // Remover backups antigos
    oldBackups.forEach((timestamp: string) => {
      localStorage.removeItem(`backup_${timestamp}`);
    });

    // Atualizar lista
    const updatedList = backupList.filter((t: string) => !oldBackups.includes(t));
    localStorage.setItem('backup_list', JSON.stringify(updatedList));

    if (oldBackups.length > 0) {
      console.log(`Removidos ${oldBackups.length} backups antigos`);
    }
  }

  // Restaurar backup
  async restoreBackup(timestamp: string) {
    try {
      // Tentar restaurar do servidor primeiro
      const backupData = await this.getBackupFromServer(timestamp);
      
      if (backupData && backupData.data) {
        this.applyBackupData(backupData.data);
        console.log('Backup restaurado do servidor com sucesso');
        return true;
      }
    } catch (error) {
      console.warn('Erro ao restaurar do servidor, tentando localmente:', error);
    }

    // Fallback: restaurar do localStorage
    const backupKey = `backup_${timestamp}`;
    const localBackup = this.getLocalStorageItem(backupKey);
    
    if (localBackup && localBackup.data) {
      this.applyBackupData(localBackup.data);
      console.log('Backup restaurado localmente com sucesso');
      return true;
    }

    throw new Error('Backup não encontrado');
  }

  // Buscar backup do servidor
  private async getBackupFromServer(timestamp: string): Promise<any> {
    const response = await fetch(`http://72.60.246.250:8087/bancoexterno/backups/${timestamp}`);
    if (!response.ok) {
      throw new Error('Backup não encontrado no servidor');
    }
    return await response.json();
  }

  // Aplicar dados do backup
  private applyBackupData(data: any) {
    if (data.users) {
      localStorage.setItem('app_users', JSON.stringify(data.users));
    }
    if (data.cash_movements) {
      localStorage.setItem('cash_movements', JSON.stringify(data.cash_movements));
    }
    if (data.marketplace_orders) {
      localStorage.setItem('marketplace_orders', JSON.stringify(data.marketplace_orders));
    }
    if (data.products_meta) {
      localStorage.setItem('products_meta', JSON.stringify(data.products_meta));
    }
    if (data.settings) {
      Object.entries(data.settings).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value as string);
      });
    }
    if (data.custom_audios) {
      Object.entries(data.custom_audios).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
    }
  }

  // Listar backups disponíveis
  listBackups(): string[] {
    return this.getLocalStorageItem('backup_list') || [];
  }
}

export const autoBackupManager = new AutoBackupManager();
