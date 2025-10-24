import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Clock, CheckCircle2, Package, MapPin, Download, Settings } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { ManualOrderForm } from "@/components/marketplace/ManualOrderForm";
import { TestModeControl } from "@/components/marketplace/TestModeControl";
import { initializeMarketplaceStorage, validateAndNormalizeOrders, updateOrderStatus } from "@/utils/marketplaceSync";
import { SoundAlertControl } from "@/components/SoundAlertControl";

interface MarketplaceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  items: { product: string; quantity: number; location?: string }[];
  status: "pendente" | "separando" | "concluido" | "concluído";
  created_date: string;
  created_at?: string;
  completed_by?: string;
}

export default function MarketplaceOrders() {
  const queryClient = useQueryClient();
  const [employeeName, setEmployeeName] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("bling");
  const { playAlert, alertMode } = useSoundAlert();

  // Inicializar e normalizar pedidos ao carregar
  useEffect(() => {
    initializeMarketplaceStorage();
    validateAndNormalizeOrders();
  }, []);

  const { data: orders = [], refetch, dataUpdatedAt } = useQuery({
    queryKey: ['marketplace-orders'],
    queryFn: async () => {
      const normalized = validateAndNormalizeOrders();
      return normalized.sort((a, b) => {
        const dateA = new Date(a.created_date || a.created_at || '').getTime();
        const dateB = new Date(b.created_date || b.created_at || '').getTime();
        return dateB - dateA;
      });
    },
    refetchInterval: 5000,
  });

  // Tocar alerta quando novo pedido chegar (lógica simples e eficiente)
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    const pendingOrders = orders.filter(o => o.status === 'pendente');
    const lastCheckKey = 'marketplace_orders_last_check';
    const lastCheck = localStorage.getItem(lastCheckKey);
    const lastCheckTime = lastCheck ? new Date(lastCheck).getTime() : 0;
    
    const newOrders = pendingOrders.filter(o => {
      const orderTime = new Date(o.created_date || o.created_at || '').getTime();
      return orderTime > lastCheckTime;
    });
    
    if (newOrders.length > 0 && alertMode === 'on-order') {
      console.log('🔔 Novos pedidos:', newOrders.length);
      playAlert('new-order');
    }
    
    localStorage.setItem(lastCheckKey, new Date().toISOString());
  }, [dataUpdatedAt, alertMode, playAlert]);

  const completeOrderMutation = useMutation({
    mutationFn: async ({ orderId, employeeName }: { orderId: string; employeeName: string }) => {
      const success = updateOrderStatus(orderId, 'concluido', employeeName);
      if (!success) {
        throw new Error('Falha ao atualizar pedido');
      }
      return { orderId, employeeName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-orders'] });
      toast.success("Pedido marcado como concluído!");
    },
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: { label: "Pendente", className: "bg-yellow-500", icon: Clock },
      separando: { label: "Separando", className: "bg-blue-500", icon: Package },
      concluido: { label: "Concluído", className: "bg-green-500", icon: CheckCircle2 }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const pendingOrders = orders.filter(o => o.status !== "concluido" && o.status !== "concluído");
  const completedOrders = orders.filter(o => o.status === "concluido" || o.status === "concluído");
  
  const handleImportOrders = () => {
    const mode = localStorage.getItem('marketplace_mode') || 'teste';
    const integrationNames = {
      bling: "Bling",
      tiny: "Tiny",
      shopee: "Shopee",
      mercadolivre: "Mercado Livre",
      aliexpress: "AliExpress",
      tiktok: "TikTok",
      shein: "Shein"
    };
    
    const integrationName = integrationNames[selectedIntegration as keyof typeof integrationNames];
    
    if (mode === 'producao') {
      toast.error(`Modo Produção: Configure as credenciais de API para ${integrationName} nas Configurações`);
      return;
    }
    
    // Modo teste: gerar pedidos fake
    toast.info(`Importando pedidos de teste de ${integrationName}...`);
    
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    const now = new Date().toISOString();
    const integrationPrefixes: Record<string, string> = {
      bling: 'BLG',
      tiny: 'TNY',
      shopee: 'SPE',
      mercadolivre: 'MLD',
      aliexpress: 'ALI',
      tiktok: 'TIK',
      shein: 'SHN'
    };
    
    const fakeOrders = [
      {
        id: `${Date.now()}-1`,
        order_number: `${integrationPrefixes[selectedIntegration]}-${Math.floor(Math.random() * 10000)}`,
        customer_name: "Cliente Teste A",
        items: [{ product: "Fliperama Metal", quantity: 1, location: "A-1" }],
        status: 'pendente' as const,
        created_date: now,
        created_at: now,
        source: selectedIntegration
      },
      {
        id: `${Date.now()}-2`,
        order_number: `${integrationPrefixes[selectedIntegration]}-${Math.floor(Math.random() * 10000)}`,
        customer_name: "Cliente Teste B",
        items: [
          { product: "Controle Metal", quantity: 2, location: "B-2" },
          { product: "Protetor", quantity: 5, location: "C-1" }
        ],
        status: 'pendente' as const,
        created_date: now,
        created_at: now,
        source: selectedIntegration
      },
      {
        id: `${Date.now()}-3`,
        order_number: `${integrationPrefixes[selectedIntegration]}-${Math.floor(Math.random() * 10000)}`,
        customer_name: "Cliente Teste C",
        items: [{ product: "Comando Fliperama", quantity: 10, location: "D-3" }],
        status: 'pendente' as const,
        created_date: now,
        created_at: now,
        source: selectedIntegration
      }
    ];
    
    const allOrders = [...orders, ...fakeOrders];
    localStorage.setItem('marketplace_orders', JSON.stringify(allOrders));
    
    setTimeout(() => {
      toast.success(`3 pedidos de teste importados de ${integrationName}!`);
      refetch();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <ShoppingBag className="w-16 h-16 text-purple-400" />
            <h1 className="text-6xl font-bold text-white">PEDIDOS MARKETPLACE</h1>
          </div>
          <p className="text-2xl text-slate-300 text-center mb-6">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })}
          </p>
          
          {/* Botões de Ação */}
          <div className="flex justify-center gap-4 flex-wrap items-center">
            <ManualOrderForm onOrderCreated={refetch} />
            
            <Button
              onClick={() => setShowTestMode(!showTestMode)}
              size="lg"
              variant={showTestMode ? "default" : "outline"}
              className="gap-2"
            >
              <Settings className="w-5 h-5" />
              {showTestMode ? 'Ocultar Configurações' : 'Modo Teste/Produção'}
            </Button>
            
            <div className="flex gap-2 items-center">
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger className="w-[200px] bg-white text-slate-900 border-2 border-purple-400">
                  <SelectValue placeholder="Selecione integração" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="bling">Bling</SelectItem>
                  <SelectItem value="tiny">Tiny</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                  <SelectItem value="aliexpress">AliExpress</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="shein">Shein</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleImportOrders}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Importar Pedidos
              </Button>
            </div>
          </div>
          
          {/* Painel de Configuração de Modo */}
          {showTestMode && (
            <div className="max-w-2xl mx-auto mt-6">
              <TestModeControl />
            </div>
          )}
        </div>

        {/* Pedidos Ativos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            Pedidos para Separação
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingOrders.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhum pedido pendente</p>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card 
                    key={order.id}
                    className="bg-slate-800 border-2 border-slate-700 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
                  >
                    <CardHeader className="pb-4 bg-gradient-to-r from-purple-600 to-blue-600">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl text-white font-bold flex items-center gap-3">
                          <StatusIcon className="w-8 h-8" />
                          {order.order_number}
                        </CardTitle>
                        <Badge className={`${statusConfig.className} text-white text-lg px-4 py-2`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-slate-200 text-xl mt-2">{order.customer_name}</p>
                    </CardHeader>
                    
                    <CardContent className="pt-6 space-y-4">
                      {/* Itens do Pedido */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-slate-900 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-white text-xl font-semibold">{item.product}</p>
                                <p className="text-green-400 text-2xl font-bold mt-1">
                                  Qtd: {item.quantity}
                                </p>
                              </div>
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-2 mt-3 text-blue-400">
                                <MapPin className="w-4 h-4" />
                                <p className="text-sm">{item.location}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Ação de Conclusão */}
                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`complete-${order.id}`}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const name = prompt("Digite seu nome para confirmar:");
                                if (name) {
                                  completeOrderMutation.mutate({ 
                                    orderId: order.id, 
                                    employeeName: name 
                                  });
                                }
                              }
                            }}
                            className="w-6 h-6"
                          />
                          <label 
                            htmlFor={`complete-${order.id}`}
                            className="text-white text-xl cursor-pointer"
                          >
                            Marcar como Separado
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Pedidos Concluídos Hoje */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              Concluídos Hoje
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedOrders.map((order) => (
                <Card key={order.id} className="bg-slate-800/50 border border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-lg font-bold">{order.order_number}</p>
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-slate-400 text-sm">{order.customer_name}</p>
                    {order.completed_by && (
                      <p className="text-slate-500 text-xs mt-2">Por: {order.completed_by}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
