import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Database, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function TestModeControl() {
  const [mode, setMode] = useState<'teste' | 'producao'>('teste');

  useEffect(() => {
    const savedMode = localStorage.getItem('marketplace_mode') as 'teste' | 'producao' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'teste' ? 'producao' : 'teste';
    setMode(newMode);
    localStorage.setItem('marketplace_mode', newMode);
    toast.success(`Modo alterado para: ${newMode.toUpperCase()}`);
  };

  const generateFakeOrders = (integration: string) => {
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    const now = new Date().toISOString();
    
    const fakeOrdersTemplates = [
      {
        customer: "João Silva",
        products: [
          { product: "Fliperama Metal 1 Player", quantity: 1, location: "Estoque A-1" }
        ]
      },
      {
        customer: "Maria Santos",
        products: [
          { product: "Controle Metal 2 Players", quantity: 2, location: "Estoque B-3" },
          { product: "Protetor", quantity: 5, location: "Estoque C-2" }
        ]
      },
      {
        customer: "Pedro Costa",
        products: [
          { product: "Fliperama Metal 2 Players", quantity: 1, location: "Estoque A-2" },
          { product: "Comando para Fliperama", quantity: 10, location: "Estoque D-1" }
        ]
      }
    ];

    const integrationPrefixes: Record<string, string> = {
      bling: 'BLG',
      tiny: 'TNY',
      shopee: 'SPE',
      mercadolivre: 'MLD',
      aliexpress: 'ALI',
      tiktok: 'TIK',
      shein: 'SHN'
    };

    const newOrders = fakeOrdersTemplates.map((template, idx) => ({
      id: `${Date.now()}-${idx}`,
      order_number: `${integrationPrefixes[integration]}-${Math.floor(Math.random() * 10000)}`,
      customer_name: template.customer,
      items: template.products,
      status: 'pendente',
      created_date: now,
      created_at: now,
      source: integration
    }));

    const allOrders = [...orders, ...newOrders];
    localStorage.setItem('marketplace_orders', JSON.stringify(allOrders));
    
    toast.success(`${newOrders.length} pedidos fake de ${integration.toUpperCase()} criados!`);
    window.location.reload();
  };

  const clearAllOrders = () => {
    if (confirm('Deseja realmente limpar TODOS os pedidos? Esta ação não pode ser desfeita.')) {
      localStorage.setItem('marketplace_orders', '[]');
      toast.success('Todos os pedidos foram removidos');
      window.location.reload();
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          Configurações de Integração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modo Atual */}
        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Modo Atual</p>
            <Badge variant={mode === 'producao' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
              {mode === 'teste' ? '🧪 MODO TESTE' : '🚀 PRODUÇÃO'}
            </Badge>
          </div>
          <Button onClick={toggleMode} variant="outline" size="lg">
            Alternar Modo
          </Button>
        </div>

        {/* Explicação */}
        <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/50 rounded-lg">
          <p><strong>Modo Teste:</strong> Usa pedidos fake para desenvolvimento e testes</p>
          <p><strong>Modo Produção:</strong> Conecta com APIs reais das integrações</p>
        </div>

        {/* Gerar Pedidos Fake (apenas em modo teste) */}
        {mode === 'teste' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Gerar Pedidos de Teste</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => generateFakeOrders('bling')} variant="outline" size="sm">
                Bling (3 pedidos)
              </Button>
              <Button onClick={() => generateFakeOrders('tiny')} variant="outline" size="sm">
                Tiny (3 pedidos)
              </Button>
              <Button onClick={() => generateFakeOrders('shopee')} variant="outline" size="sm">
                Shopee (3 pedidos)
              </Button>
              <Button onClick={() => generateFakeOrders('mercadolivre')} variant="outline" size="sm">
                Mercado Livre (3)
              </Button>
              <Button onClick={() => generateFakeOrders('aliexpress')} variant="outline" size="sm">
                AliExpress (3)
              </Button>
              <Button onClick={() => generateFakeOrders('tiktok')} variant="outline" size="sm">
                TikTok (3 pedidos)
              </Button>
              <Button onClick={() => generateFakeOrders('shein')} variant="outline" size="sm">
                Shein (3 pedidos)
              </Button>
            </div>
          </div>
        )}

        {/* Limpar todos os pedidos */}
        <Button 
          onClick={clearAllOrders} 
          variant="destructive" 
          className="w-full gap-2"
          size="lg"
        >
          <Trash2 className="w-5 h-5" />
          Limpar Todos os Pedidos
        </Button>

        {/* Status */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          {mode === 'producao' ? 
            '⚠️ Em produção: as integrações usarão as APIs reais' :
            '✅ Em teste: usando dados simulados para desenvolvimento'
          }
        </div>
      </CardContent>
    </Card>
  );
}
