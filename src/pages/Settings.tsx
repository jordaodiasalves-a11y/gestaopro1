import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Download, Upload, Volume2, FileJson, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [blingConfig, setBlingConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [tinyConfig, setTinyConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [audioFile, setAudioFile] = useState<string>('');

  useEffect(() => {
    const storedBling = localStorage.getItem('blingConfig');
    const storedTiny = localStorage.getItem('tinyConfig');
    const storedAudio = localStorage.getItem('notificationAudio');
    
    if (storedBling) setBlingConfig(JSON.parse(storedBling));
    if (storedTiny) setTinyConfig(JSON.parse(storedTiny));
    if (storedAudio) setAudioFile(storedAudio);
  }, []);

  const saveBlingConfig = () => {
    localStorage.setItem('blingConfig', JSON.stringify(blingConfig));
    toast.success("Configuração Bling salva!");
  };

  const saveTinyConfig = () => {
    localStorage.setItem('tinyConfig', JSON.stringify(tinyConfig));
    toast.success("Configuração Tiny salva!");
  };

  const startOAuthFlow = (platform: string) => {
    toast.info(`Iniciando autenticação OAuth 2.0 para ${platform}...`);
    setTimeout(() => {
      if (platform === 'Bling') {
        setBlingConfig({ ...blingConfig, accessToken: 'mock_token_bling_' + Date.now() });
      } else {
        setTinyConfig({ ...tinyConfig, accessToken: 'mock_token_tiny_' + Date.now() });
      }
      toast.success(`Autenticado com sucesso no ${platform}!`);
    }, 1500);
  };

  const importOrders = async (platform: string) => {
    setIsImporting(true);
    toast.info(`Importando pedidos do ${platform}...`);
    
    setTimeout(() => {
      setIsImporting(false);
      toast.success(`5 pedidos importados do ${platform}!`);
    }, 2000);
  };

  const exportBackup = () => {
    const data = {
      products: localStorage.getItem('base44_Product') || '[]',
      sales: localStorage.getItem('base44_Sale') || '[]',
      customers: localStorage.getItem('base44_Customer') || '[]',
      suppliers: localStorage.getItem('base44_Supplier') || '[]',
      expenses: localStorage.getItem('base44_Expense') || '[]',
      services: localStorage.getItem('base44_Service') || '[]',
      materials: localStorage.getItem('base44_Material') || '[]',
      employees: localStorage.getItem('base44_Employee') || '[]',
      assets: localStorage.getItem('base44_Asset') || '[]',
      production: localStorage.getItem('base44_Production') || '[]',
      cash_movements: localStorage.getItem('cash_movements') || '[]',
      marketplace_orders: localStorage.getItem('marketplace_orders') || '[]',
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestao_pro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso!");
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        Object.keys(data).forEach(key => {
          if (key !== 'exportDate' && data[key]) {
            localStorage.setItem(key.startsWith('base44_') ? key : key, data[key]);
          }
        });
        
        toast.success("Backup importado com sucesso! Recarregando página...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error("Erro ao importar backup. Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const audioData = e.target?.result as string;
      localStorage.setItem('notificationAudio', audioData);
      setAudioFile(audioData);
      toast.success("Áudio de notificação carregado!");
    };
    reader.readAsDataURL(file);
  };

  const playTestSound = () => {
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play().catch(() => toast.error("Erro ao reproduzir áudio"));
      toast.info("Reproduzindo áudio de teste...");
    } else {
      // Som padrão
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltrzxnMpBSh+zPLaizsIGGS57OihUhELTKXh8bllHAU2jdXzz3osBR13x/DhjUYMElyx6+yoUxEMTKPg8LxnHgU0itPz0H0vBSp7y/DaizwKGWW57OmnVBIMTKXi8btvJAU6mtrzxH0qBSh5x/DglkcPGGi+7u+vYx0JM5DY89l1KAQtdsrw34tBEBJUpuvxsGUbCDGO0PPVfC0GK3vJ8N+PRA8RX6vo7qxUEAxRqOLwt2cuBzeLz/PWey4FKXnJ8N+RRhEQY6rp7q5cFwg5kdXzzn8wBzF9zfLfkUgSEGKp5u6xZicHNIzS8tN6LwYrf8rx4ZJKExFipubur2IdCDiQ1vPTeC0FLHzJ8OCSTBUSTqXk7rdnJQcyh9Dz1Xw0Ci9+yfDjk08WFFCn5O+3aCUGM4jP89V9NQsufsrw5JVSGBVQp+TwuGgmBzSHz/PXgjkOL4HM8uSWVhsSUKjl8blpJgcyhs/z1oE6DzF/y/LklVgcE1Ko5fG7azEHM4XQ89aAOwwyfsvy5JVaHxVUq+fyrm8xCTN/zfPahD4RM4DL8uaVWyAVVKvn8q9xNAo0f87z24U/EzN/zfLmlV0hFlWr5/KwcjYNNoXO89yGQBU0gM7y55ZfIxZVrOjzsnI4DzaFzvPdhkEXNIHO8uiWYSQXVqzp9LRzOg84g8/z3odBGTSDzvLplmEmF1at6fW1dDsQOIPP8+GIQhk0g87y6pdkJxhXruj1tXU7ETiD0PPiiEMbNILO8uuZZikaV67o9bV1OxQ5g9Dz4olEGzSDzvLrmWgpGleu6PW2dzoWOYPP8+OJRBs0gs7y7JlqKxpXruj1tnc5Fzl90/LtiUYcNILO8u2aaywaWK/o9bh4ORo6fdPy7YpGHTSDzvLumm8sG1iw6PW5eDoaOn3T8u6LRx40g87y75twLRtYsOj1u3g6HT1+0/Lui0gdNILO8vCbcS4cWLDo9b14Ox8+ftPy74xKHzSDzvLxnHMvHFmw6PW+eTwgPn7T8vCMSh81gs3y8p1zLx1asOj1wHo9IT1+0/LwjUsf");
      audio.play().catch(() => toast.error("Erro ao reproduzir áudio"));
      toast.info("Reproduzindo som padrão...");
    }
  };

  const isConfigured = (config: any) => {
    return config.authType === 'oauth' ? !!config.accessToken : !!config.apiKey;
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
          </div>
          <p className="text-slate-600">Gerencie integrações, notificações e backup do sistema</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* Integrações */}
          <TabsContent value="integrations">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bling */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração Bling</CardTitle>
                    {isConfigured(blingConfig) && (
                      <Badge className="bg-green-500">Conectado</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={blingConfig.authType} onValueChange={(v) => setBlingConfig({ ...blingConfig, authType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {blingConfig.authType === 'oauth' ? (
                    <>
                      <div>
                        <Label>Client ID</Label>
                        <Input value={blingConfig.clientId} onChange={(e) => setBlingConfig({ ...blingConfig, clientId: e.target.value })} />
                      </div>
                      <div>
                        <Label>Client Secret</Label>
                        <Input type="password" value={blingConfig.clientSecret} onChange={(e) => setBlingConfig({ ...blingConfig, clientSecret: e.target.value })} />
                      </div>
                      <Button onClick={() => startOAuthFlow('Bling')} className="w-full" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Autorizar via OAuth 2.0
                      </Button>
                    </>
                  ) : (
                    <div>
                      <Label>API Key</Label>
                      <Input value={blingConfig.apiKey} onChange={(e) => setBlingConfig({ ...blingConfig, apiKey: e.target.value })} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={saveBlingConfig} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('Bling')} disabled={!isConfigured(blingConfig) || isImporting} variant="secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Importar Pedidos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tiny */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração Tiny</CardTitle>
                    {isConfigured(tinyConfig) && (
                      <Badge className="bg-green-500">Conectado</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={tinyConfig.authType} onValueChange={(v) => setTinyConfig({ ...tinyConfig, authType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tinyConfig.authType === 'oauth' ? (
                    <>
                      <div>
                        <Label>Client ID</Label>
                        <Input value={tinyConfig.clientId} onChange={(e) => setTinyConfig({ ...tinyConfig, clientId: e.target.value })} />
                      </div>
                      <div>
                        <Label>Client Secret</Label>
                        <Input type="password" value={tinyConfig.clientSecret} onChange={(e) => setTinyConfig({ ...tinyConfig, clientSecret: e.target.value })} />
                      </div>
                      <Button onClick={() => startOAuthFlow('Tiny')} className="w-full" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Autorizar via OAuth 2.0
                      </Button>
                    </>
                  ) : (
                    <div>
                      <Label>API Key</Label>
                      <Input value={tinyConfig.apiKey} onChange={(e) => setTinyConfig({ ...tinyConfig, apiKey: e.target.value })} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={saveTinyConfig} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('Tiny')} disabled={!isConfigured(tinyConfig) || isImporting} variant="secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Importar Pedidos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notificações de Áudio */}
          <TabsContent value="notifications">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-6 h-6" />
                  Notificações de Áudio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label>Upload de Áudio Personalizado</Label>
                  <p className="text-sm text-slate-600 mb-2">
                    Carregue um arquivo de áudio (.mp3, .wav) para usar nas notificações dos monitores
                  </p>
                  <Input type="file" accept="audio/*" onChange={handleAudioUpload} />
                </div>

                <div className="flex gap-3">
                  <Button onClick={playTestSound} variant="outline" className="flex-1">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Testar Som
                  </Button>
                  {audioFile && (
                    <Button onClick={() => {
                      const a = document.createElement('a');
                      a.href = audioFile;
                      a.download = 'notification_sound.mp3';
                      a.click();
                      toast.success("Áudio baixado!");
                    }} variant="secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Áudio
                    </Button>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>💡 Dica:</strong> O áudio será reproduzido automaticamente nos monitores externos 
                    (Monitor Produção, Monitor Gestão, Monitor Produtos) a cada 5 minutos quando houver itens pendentes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup */}
          <TabsContent value="backup">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Exportar Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-slate-600">
                    Exporte todos os dados do sistema em formato JSON para backup de segurança.
                  </p>
                  <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-slate-900">Dados incluídos:</p>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                      <li>Produtos e variações</li>
                      <li>Vendas e serviços</li>
                      <li>Clientes e fornecedores</li>
                      <li>Despesas e caixa</li>
                      <li>Materiais e estoque</li>
                      <li>Funcionários e ativos</li>
                      <li>Produção e pedidos marketplace</li>
                    </ul>
                  </div>
                  <Button onClick={exportBackup} className="w-full bg-orange-600 hover:bg-orange-700">
                    <FileJson className="w-4 h-4 mr-2" />
                    Exportar Backup Completo
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    Importar Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-slate-600">
                    Restaure todos os dados do sistema a partir de um arquivo de backup anterior.
                  </p>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 mb-2">⚠️ Atenção!</p>
                    <p className="text-sm text-red-700">
                      A importação irá <strong>substituir todos os dados atuais</strong> do sistema. 
                      Certifique-se de ter um backup antes de prosseguir.
                    </p>
                  </div>
                  <div>
                    <Label>Selecionar Arquivo de Backup (.json)</Label>
                    <Input type="file" accept=".json" onChange={importBackup} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
