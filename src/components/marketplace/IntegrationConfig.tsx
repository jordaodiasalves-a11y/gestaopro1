import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Download, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Integration {
  name: 'bling' | 'tiny';
  authType: 'oauth' | 'credentials';
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
}

export function IntegrationConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [blingConfig, setBlingConfig] = useState<Integration>({
    name: 'bling',
    authType: 'credentials'
  });
  const [tinyConfig, setTinyConfig] = useState<Integration>({
    name: 'tiny',
    authType: 'credentials'
  });
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const storedBling = localStorage.getItem('bling_integration');
    const storedTiny = localStorage.getItem('tiny_integration');
    
    if (storedBling) setBlingConfig(JSON.parse(storedBling));
    if (storedTiny) setTinyConfig(JSON.parse(storedTiny));
  }, []);

  const saveBlingConfig = () => {
    localStorage.setItem('bling_integration', JSON.stringify(blingConfig));
    toast.success('Configuração da Bling salva!');
  };

  const saveTinyConfig = () => {
    localStorage.setItem('tiny_integration', JSON.stringify(tinyConfig));
    toast.success('Configuração do Tiny salva!');
  };

  const startOAuthFlow = (platform: 'bling' | 'tiny') => {
    toast.info(`Iniciando autenticação OAuth 2.0 com ${platform.toUpperCase()}...`);
    // Aqui você implementaria o fluxo OAuth real
    // Por enquanto, simula o processo
    setTimeout(() => {
      const token = 'oauth_token_' + Math.random().toString(36).substring(7);
      if (platform === 'bling') {
        setBlingConfig({ ...blingConfig, accessToken: token });
        localStorage.setItem('bling_integration', JSON.stringify({ ...blingConfig, accessToken: token }));
      } else {
        setTinyConfig({ ...tinyConfig, accessToken: token });
        localStorage.setItem('tiny_integration', JSON.stringify({ ...tinyConfig, accessToken: token }));
      }
      toast.success(`Conectado com ${platform.toUpperCase()} via OAuth!`);
    }, 1500);
  };

  const importOrders = async (platform: 'bling' | 'tiny') => {
    setIsImporting(true);
    toast.info(`Importando pedidos do ${platform.toUpperCase()}...`);
    
    // Simular importação (você deve implementar a chamada real à API)
    setTimeout(() => {
      const mockOrders = [
        {
          id: Date.now().toString(),
          order_number: `${platform.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          customer_name: 'Cliente Importado',
          items: [
            { product: 'Produto Importado', quantity: 5, location: 'Estoque A' }
          ],
          status: 'pendente',
          created_date: new Date().toISOString(),
          source: platform
        }
      ];

      const existingOrders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
      localStorage.setItem('marketplace_orders', JSON.stringify([...existingOrders, ...mockOrders]));
      
      setIsImporting(false);
      toast.success(`${mockOrders.length} pedido(s) importado(s) do ${platform.toUpperCase()}!`);
    }, 2000);
  };

  const isConfigured = (config: Integration) => {
    if (config.authType === 'oauth') {
      return !!config.accessToken;
    }
    return !!config.apiKey;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="gap-2">
          <Settings className="w-5 h-5" />
          Integrações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configurar Integrações</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="bling" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bling" className="gap-2">
              Bling
              {isConfigured(blingConfig) && <Badge variant="default" className="ml-2">Conectado</Badge>}
            </TabsTrigger>
            <TabsTrigger value="tiny" className="gap-2">
              Tiny
              {isConfigured(tinyConfig) && <Badge variant="default" className="ml-2">Conectado</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bling" className="space-y-6 mt-6">
            <div className="space-y-4">
              <Label className="text-lg">Método de Autenticação</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={blingConfig.authType === 'oauth' ? 'default' : 'outline'}
                  onClick={() => setBlingConfig({ ...blingConfig, authType: 'oauth' })}
                  className="flex-1"
                >
                  OAuth 2.0
                </Button>
                <Button
                  type="button"
                  variant={blingConfig.authType === 'credentials' ? 'default' : 'outline'}
                  onClick={() => setBlingConfig({ ...blingConfig, authType: 'credentials' })}
                  className="flex-1"
                >
                  Login e Senha
                </Button>
              </div>
            </div>

            {blingConfig.authType === 'oauth' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={blingConfig.clientId || ''}
                    onChange={(e) => setBlingConfig({ ...blingConfig, clientId: e.target.value })}
                    placeholder="Seu Client ID da Bling"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    value={blingConfig.clientSecret || ''}
                    onChange={(e) => setBlingConfig({ ...blingConfig, clientSecret: e.target.value })}
                    placeholder="Seu Client Secret da Bling"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => startOAuthFlow('bling')} className="flex-1 gap-2">
                    <Key className="w-4 h-4" />
                    Autorizar via OAuth
                  </Button>
                  <Button onClick={saveBlingConfig} variant="outline" className="flex-1">
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key da Bling</Label>
                  <Input
                    type="password"
                    value={blingConfig.apiKey || ''}
                    onChange={(e) => setBlingConfig({ ...blingConfig, apiKey: e.target.value })}
                    placeholder="Cole sua API Key aqui"
                  />
                </div>
                <Button onClick={saveBlingConfig} className="w-full">
                  Salvar Configuração
                </Button>
              </div>
            )}

            {isConfigured(blingConfig) && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => importOrders('bling')} 
                  disabled={isImporting}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  {isImporting ? 'Importando...' : 'Importar Pedidos da Bling'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tiny" className="space-y-6 mt-6">
            <div className="space-y-4">
              <Label className="text-lg">Método de Autenticação</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={tinyConfig.authType === 'oauth' ? 'default' : 'outline'}
                  onClick={() => setTinyConfig({ ...tinyConfig, authType: 'oauth' })}
                  className="flex-1"
                >
                  OAuth 2.0
                </Button>
                <Button
                  type="button"
                  variant={tinyConfig.authType === 'credentials' ? 'default' : 'outline'}
                  onClick={() => setTinyConfig({ ...tinyConfig, authType: 'credentials' })}
                  className="flex-1"
                >
                  Login e Senha
                </Button>
              </div>
            </div>

            {tinyConfig.authType === 'oauth' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={tinyConfig.clientId || ''}
                    onChange={(e) => setTinyConfig({ ...tinyConfig, clientId: e.target.value })}
                    placeholder="Seu Client ID do Tiny"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    value={tinyConfig.clientSecret || ''}
                    onChange={(e) => setTinyConfig({ ...tinyConfig, clientSecret: e.target.value })}
                    placeholder="Seu Client Secret do Tiny"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => startOAuthFlow('tiny')} className="flex-1 gap-2">
                    <Key className="w-4 h-4" />
                    Autorizar via OAuth
                  </Button>
                  <Button onClick={saveTinyConfig} variant="outline" className="flex-1">
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token do Tiny</Label>
                  <Input
                    type="password"
                    value={tinyConfig.apiKey || ''}
                    onChange={(e) => setTinyConfig({ ...tinyConfig, apiKey: e.target.value })}
                    placeholder="Cole seu token aqui"
                  />
                </div>
                <Button onClick={saveTinyConfig} className="w-full">
                  Salvar Configuração
                </Button>
              </div>
            )}

            {isConfigured(tinyConfig) && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => importOrders('tiny')} 
                  disabled={isImporting}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  {isImporting ? 'Importando...' : 'Importar Pedidos do Tiny'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
