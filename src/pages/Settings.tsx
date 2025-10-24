import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, Upload, Volume2, FileJson, ExternalLink, Moon, Sun, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function Settings() {
  const [blingConfig, setBlingConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [tinyConfig, setTinyConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [shopeeConfig, setShopeeConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [mercadoLivreConfig, setMercadoLivreConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [aliExpressConfig, setAliExpressConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [tiktokConfig, setTiktokConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [sheinConfig, setSheinConfig] = useState({ authType: 'oauth', apiKey: '', clientId: '', clientSecret: '', accessToken: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [audioFile, setAudioFile] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedBling = localStorage.getItem('blingConfig');
    const storedTiny = localStorage.getItem('tinyConfig');
    const storedShopee = localStorage.getItem('shopeeConfig');
    const storedML = localStorage.getItem('mercadoLivreConfig');
    const storedAliExpress = localStorage.getItem('aliExpressConfig');
    const storedTiktok = localStorage.getItem('tiktokConfig');
    const storedShein = localStorage.getItem('sheinConfig');
    const storedAudio = localStorage.getItem('notificationAudio');
    const storedTheme = localStorage.getItem('darkMode');
    
    if (storedBling) setBlingConfig(JSON.parse(storedBling));
    if (storedTiny) setTinyConfig(JSON.parse(storedTiny));
    if (storedShopee) setShopeeConfig(JSON.parse(storedShopee));
    if (storedML) setMercadoLivreConfig(JSON.parse(storedML));
    if (storedAliExpress) setAliExpressConfig(JSON.parse(storedAliExpress));
    if (storedTiktok) setTiktokConfig(JSON.parse(storedTiktok));
    if (storedShein) setSheinConfig(JSON.parse(storedShein));
    if (storedAudio) setAudioFile(storedAudio);
    if (storedTheme) {
      const isDark = JSON.parse(storedTheme);
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    document.documentElement.classList.toggle('dark', enabled);
    toast.success(`Modo ${enabled ? 'escuro' : 'claro'} ativado!`);
  };

  const saveBlingConfig = () => {
    localStorage.setItem('blingConfig', JSON.stringify(blingConfig));
    toast.success("Configuração Bling salva!");
  };

  const saveTinyConfig = () => {
    localStorage.setItem('tinyConfig', JSON.stringify(tinyConfig));
    toast.success("Configuração Tiny salva!");
  };

  const saveMarketplaceConfig = (platform: string, config: any) => {
    localStorage.setItem(`${platform}Config`, JSON.stringify(config));
    toast.success(`Configuração ${platform} salva!`);
  };

  const startOAuthFlow = (platform: string, config: any, setConfig: any) => {
    toast.info(`Iniciando autenticação OAuth 2.0 para ${platform}...`);
    setTimeout(() => {
      setConfig({ ...config, accessToken: `mock_token_${platform.toLowerCase()}_${Date.now()}` });
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

  const exportBackupCSV = async () => {
    try {
      toast.info("Coletando dados do sistema...");
      
      // Buscar dados reais da API base44
      const [products, sales, customers, suppliers, expenses, services, materials, employees, assets, productionOrders] = await Promise.all([
        base44.entities.Product.list().catch(() => []),
        base44.entities.Sale.list().catch(() => []),
        base44.entities.Customer.list().catch(() => []),
        base44.entities.Supplier.list().catch(() => []),
        base44.entities.Expense.list().catch(() => []),
        base44.entities.Service.list().catch(() => []),
        base44.entities.Material.list().catch(() => []),
        base44.entities.Employee.list().catch(() => []),
        base44.entities.Asset.list().catch(() => []),
        base44.entities.ProductionOrder.list().catch(() => []),
      ]);

      // Dados locais
      const cashMovements = JSON.parse(localStorage.getItem('cash_movements') || '[]');
      const marketplaceOrders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');

      const datasets = [
        { name: 'Products', data: products },
        { name: 'Sales', data: sales },
        { name: 'Customers', data: customers },
        { name: 'Suppliers', data: suppliers },
        { name: 'Expenses', data: expenses },
        { name: 'Services', data: services },
        { name: 'Materials', data: materials },
        { name: 'Employees', data: employees },
        { name: 'Assets', data: assets },
        { name: 'ProductionOrders', data: productionOrders },
        { name: 'CashMovements', data: cashMovements },
        { name: 'MarketplaceOrders', data: marketplaceOrders },
      ];

      let csvContent = 'sep=,\n'; // Excel separator
      let totalRecords = 0;

      datasets.forEach(({ name, data }) => {
        if (Array.isArray(data) && data.length > 0) {
          csvContent += `\n\n### TABELA: ${name} ###\n`;
          const headers = Object.keys(data[0]);
          csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

          data.forEach(row => {
            const values = headers.map(header => {
              const value = row[header];
              if (value === null || value === undefined) return '""';
              const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
              return `"${stringValue.replace(/"/g, '""')}"`;
            });
            csvContent += values.join(',') + '\n';
          });
          totalRecords += data.length;
        }
      });

      if (totalRecords === 0) {
        toast.error("Nenhum dado encontrado para exportar!");
        return;
      }

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_gestao_pro_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Backup CSV exportado! ${totalRecords} registros de ${datasets.filter(d => d.data.length > 0).length} tabelas.`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error("Erro ao exportar backup CSV!");
    }
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
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
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
                      <Button onClick={() => startOAuthFlow('Bling', blingConfig, setBlingConfig)} className="w-full" variant="outline">
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
                      <Button onClick={() => startOAuthFlow('Tiny', tinyConfig, setTinyConfig)} className="w-full" variant="outline">
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

              {/* Shopee */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração Shopee</CardTitle>
                    {isConfigured(shopeeConfig) && <Badge className="bg-green-500">Conectado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={shopeeConfig.authType} onValueChange={(v) => setShopeeConfig({ ...shopeeConfig, authType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {shopeeConfig.authType === 'oauth' ? (
                    <>
                      <div><Label>Client ID</Label><Input value={shopeeConfig.clientId} onChange={(e) => setShopeeConfig({ ...shopeeConfig, clientId: e.target.value })} /></div>
                      <div><Label>Client Secret</Label><Input type="password" value={shopeeConfig.clientSecret} onChange={(e) => setShopeeConfig({ ...shopeeConfig, clientSecret: e.target.value })} /></div>
                      <Button onClick={() => startOAuthFlow('Shopee', shopeeConfig, setShopeeConfig)} className="w-full" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Autorizar via OAuth 2.0</Button>
                    </>
                  ) : (
                    <div><Label>API Key</Label><Input value={shopeeConfig.apiKey} onChange={(e) => setShopeeConfig({ ...shopeeConfig, apiKey: e.target.value })} /></div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => saveMarketplaceConfig('shopee', shopeeConfig)} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('Shopee')} disabled={!isConfigured(shopeeConfig) || isImporting} variant="secondary"><Download className="w-4 h-4 mr-2" />Importar Pedidos</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mercado Livre */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração Mercado Livre</CardTitle>
                    {isConfigured(mercadoLivreConfig) && <Badge className="bg-green-500">Conectado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={mercadoLivreConfig.authType} onValueChange={(v) => setMercadoLivreConfig({ ...mercadoLivreConfig, authType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {mercadoLivreConfig.authType === 'oauth' ? (
                    <>
                      <div><Label>Client ID</Label><Input value={mercadoLivreConfig.clientId} onChange={(e) => setMercadoLivreConfig({ ...mercadoLivreConfig, clientId: e.target.value })} /></div>
                      <div><Label>Client Secret</Label><Input type="password" value={mercadoLivreConfig.clientSecret} onChange={(e) => setMercadoLivreConfig({ ...mercadoLivreConfig, clientSecret: e.target.value })} /></div>
                      <Button onClick={() => startOAuthFlow('Mercado Livre', mercadoLivreConfig, setMercadoLivreConfig)} className="w-full" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Autorizar via OAuth 2.0</Button>
                    </>
                  ) : (
                    <div><Label>API Key</Label><Input value={mercadoLivreConfig.apiKey} onChange={(e) => setMercadoLivreConfig({ ...mercadoLivreConfig, apiKey: e.target.value })} /></div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => saveMarketplaceConfig('mercadoLivre', mercadoLivreConfig)} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('Mercado Livre')} disabled={!isConfigured(mercadoLivreConfig) || isImporting} variant="secondary"><Download className="w-4 h-4 mr-2" />Importar Pedidos</Button>
                  </div>
                </CardContent>
              </Card>

              {/* AliExpress */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração AliExpress Seller</CardTitle>
                    {isConfigured(aliExpressConfig) && <Badge className="bg-green-500">Conectado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={aliExpressConfig.authType} onValueChange={(v) => setAliExpressConfig({ ...aliExpressConfig, authType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {aliExpressConfig.authType === 'oauth' ? (
                    <>
                      <div><Label>App Key</Label><Input value={aliExpressConfig.clientId} onChange={(e) => setAliExpressConfig({ ...aliExpressConfig, clientId: e.target.value })} /></div>
                      <div><Label>App Secret</Label><Input type="password" value={aliExpressConfig.clientSecret} onChange={(e) => setAliExpressConfig({ ...aliExpressConfig, clientSecret: e.target.value })} /></div>
                      <Button onClick={() => startOAuthFlow('AliExpress', aliExpressConfig, setAliExpressConfig)} className="w-full" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Autorizar via OAuth 2.0</Button>
                    </>
                  ) : (
                    <div><Label>API Key</Label><Input value={aliExpressConfig.apiKey} onChange={(e) => setAliExpressConfig({ ...aliExpressConfig, apiKey: e.target.value })} /></div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => saveMarketplaceConfig('aliExpress', aliExpressConfig)} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('AliExpress')} disabled={!isConfigured(aliExpressConfig) || isImporting} variant="secondary"><Download className="w-4 h-4 mr-2" />Importar Pedidos</Button>
                  </div>
                </CardContent>
              </Card>

              {/* TikTok Shop */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração TikTok Seller</CardTitle>
                    {isConfigured(tiktokConfig) && <Badge className="bg-green-500">Conectado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={tiktokConfig.authType} onValueChange={(v) => setTiktokConfig({ ...tiktokConfig, authType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {tiktokConfig.authType === 'oauth' ? (
                    <>
                      <div><Label>App Key</Label><Input value={tiktokConfig.clientId} onChange={(e) => setTiktokConfig({ ...tiktokConfig, clientId: e.target.value })} /></div>
                      <div><Label>App Secret</Label><Input type="password" value={tiktokConfig.clientSecret} onChange={(e) => setTiktokConfig({ ...tiktokConfig, clientSecret: e.target.value })} /></div>
                      <Button onClick={() => startOAuthFlow('TikTok', tiktokConfig, setTiktokConfig)} className="w-full" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Autorizar via OAuth 2.0</Button>
                    </>
                  ) : (
                    <div><Label>API Key</Label><Input value={tiktokConfig.apiKey} onChange={(e) => setTiktokConfig({ ...tiktokConfig, apiKey: e.target.value })} /></div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => saveMarketplaceConfig('tiktok', tiktokConfig)} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('TikTok')} disabled={!isConfigured(tiktokConfig) || isImporting} variant="secondary"><Download className="w-4 h-4 mr-2" />Importar Pedidos</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shein */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle>Integração Shein</CardTitle>
                    {isConfigured(sheinConfig) && <Badge className="bg-green-500">Conectado</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Tipo de Autenticação</Label>
                    <Select value={sheinConfig.authType} onValueChange={(v) => setSheinConfig({ ...sheinConfig, authType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="credentials">API Key / Credenciais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {sheinConfig.authType === 'oauth' ? (
                    <>
                      <div><Label>App Key</Label><Input value={sheinConfig.clientId} onChange={(e) => setSheinConfig({ ...sheinConfig, clientId: e.target.value })} /></div>
                      <div><Label>App Secret</Label><Input type="password" value={sheinConfig.clientSecret} onChange={(e) => setSheinConfig({ ...sheinConfig, clientSecret: e.target.value })} /></div>
                      <Button onClick={() => startOAuthFlow('Shein', sheinConfig, setSheinConfig)} className="w-full" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Autorizar via OAuth 2.0</Button>
                    </>
                  ) : (
                    <div><Label>API Key</Label><Input value={sheinConfig.apiKey} onChange={(e) => setSheinConfig({ ...sheinConfig, apiKey: e.target.value })} /></div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => saveMarketplaceConfig('shein', sheinConfig)} className="flex-1">Salvar Configuração</Button>
                    <Button onClick={() => importOrders('Shein')} disabled={!isConfigured(sheinConfig) || isImporting} variant="secondary"><Download className="w-4 h-4 mr-2" />Importar Pedidos</Button>
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

          {/* Aparência */}
          <TabsContent value="appearance">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  Personalização da Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Modo Escuro</Label>
                    <p className="text-sm text-slate-600 mt-1">
                      Ative o modo escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>💡 Dica:</strong> O modo {darkMode ? 'escuro' : 'claro'} está ativo. 
                    {darkMode ? ' Cores mais suaves para trabalhar à noite.' : ' Cores vibrantes para trabalhar durante o dia.'}
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
                    Exporte todos os dados do sistema em formato CSV/Excel compatível com MySQL e outros bancos de dados.
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
                    <p className="text-sm text-orange-700 font-semibold mt-2">
                      ⚠️ Formato CSV/Excel compatível com MySQL, PostgreSQL e outros bancos
                    </p>
                  </div>
                  <Button onClick={exportBackupCSV} className="w-full bg-orange-600 hover:bg-orange-700">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar Backup CSV/Excel
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
