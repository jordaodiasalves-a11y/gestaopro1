import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Database, Download, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { autoBackupManager } from '@/utils/autoBackup';
import { externalServerSync } from '@/utils/externalServerSync';
import { toast } from 'sonner';

export function BackupManager() {
  const [backups, setBackups] = useState<string[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const list = autoBackupManager.listBackups();
    setBackups(list.sort().reverse()); // Mais recentes primeiro
    
    const last = localStorage.getItem('last_backup_date');
    setLastBackup(last);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await autoBackupManager.performBackup();
      toast.success('Backup criado com sucesso!');
      loadBackups();
    } catch (error) {
      toast.error('Erro ao criar backup');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (timestamp: string) => {
    if (!confirm(`Deseja restaurar o backup de ${timestamp}? Isso substituirá os dados atuais.`)) {
      return;
    }

    try {
      await autoBackupManager.restoreBackup(timestamp);
      toast.success('Backup restaurado com sucesso! Recarregue a página.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error('Erro ao restaurar backup');
      console.error(error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await externalServerSync.performSync();
      toast.success('Sincronização concluída!');
    } catch (error) {
      toast.error('Erro na sincronização');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const hasBackupToday = lastBackup === today;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Último Backup */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {hasBackupToday ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Último Backup</Label>
                <p className="font-medium">
                  {lastBackup ? formatDate(lastBackup) : 'Nenhum backup ainda'}
                </p>
              </div>
            </div>

            {/* Servidor Externo */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="text-xs text-muted-foreground">Servidor Externo</Label>
                <p className="font-medium text-xs break-all">
                  http://72.60.246.250:8087
                </p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <Button
              onClick={handleCreateBackup}
              disabled={creating}
              className="flex-1"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {creating ? 'Criando...' : 'Criar Backup Agora'}
            </Button>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Backups Disponíveis ({backups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum backup disponível</p>
              <p className="text-xs">Clique em "Criar Backup Agora" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((timestamp) => (
                <div
                  key={timestamp}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{formatDate(timestamp)}</p>
                    <p className="text-xs text-muted-foreground">
                      {timestamp === lastBackup && '(Mais recente)'}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRestoreBackup(timestamp)}
                    size="sm"
                    variant="outline"
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informações Importantes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Backups automáticos são criados diariamente</li>
            <li>• Os últimos 7 dias de backup são mantidos</li>
            <li>• Sincronização automática ocorre a cada 5 minutos</li>
            <li>• Dados são salvos localmente se o servidor estiver indisponível</li>
            <li>• Usuários "admin" e "salvador" são permanentes e não podem ser deletados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
