import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Clock, Package, AlertTriangle, ShoppingCart, ShoppingBag, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SoundAlertControl } from "@/components/SoundAlertControl";

// Dashboard de Produção para Monitor Externo - ROTAÇÃO AUTOMÁTICA
export default function ProductionDisplay() {
  const [currentView, setCurrentView] = useState<'orders' | 'materials' | 'products' | 'marketplace'>('orders');
  const [showControls, setShowControls] = useState(false);

  // Rotação automática a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => {
        if (prev === 'orders') return 'marketplace';
        if (prev === 'marketplace') return 'materials';
        if (prev === 'materials') return 'products';
        return 'orders';
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const { data: orders = [] } = useQuery({
    queryKey: ['production-orders-display'],
    queryFn: async () => {
      const data = await base44.entities.ProductionOrder.list();
      return data
        .filter((order: any) => order.status !== "concluido")
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_date || a.start_date).getTime();
          const dateB = new Date(b.created_date || b.start_date).getTime();
          return dateB - dateA;
        });
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['materials-display'],
    queryFn: async () => {
      const data = await base44.entities.Material.list();
      return data.filter((m: any) => m.quantity <= m.minimum_quantity);
    },
    refetchInterval: 5000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-display'],
    queryFn: async () => {
      const data = await base44.entities.Product.list();
      return data.filter((p: any) => (p.stock_quantity || 0) <= (p.minimum_stock || 0));
    },
    refetchInterval: 5000,
  });

  const { data: marketplaceOrders = [] } = useQuery({
    queryKey: ['marketplace-orders-display'],
    queryFn: async () => {
      const stored = localStorage.getItem('marketplace_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        return orders.filter((o: any) => o.status !== 'concluido');
      }
      return [];
    },
    refetchInterval: 5000,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-500",
      em_producao: "bg-blue-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "PENDENTE",
      em_producao: "EM PRODUÇÃO",
    };
    return labels[status] || status.toUpperCase();
  };

  const getViewTitle = () => {
    switch(currentView) {
      case 'orders': return 'ORDENS DE PRODUÇÃO';
      case 'marketplace': return 'PEDIDOS MARKETPLACE';
      case 'materials': return 'MATERIAIS PARA COMPRAR';
      case 'products': return 'PRODUTOS PARA REPOR';
    }
  };

  const getViewIcon = () => {
    switch(currentView) {
      case 'orders': return <Factory className="w-16 h-16 text-green-400" />;
      case 'marketplace': return <ShoppingBag className="w-16 h-16 text-purple-400" />;
      case 'materials': return <ShoppingCart className="w-16 h-16 text-orange-400" />;
      case 'products': return <Package className="w-16 h-16 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      {/* Botão de controles flutuante */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all"
      >
        {showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
      </button>

      {/* Painel de controles */}
      {showControls && (
        <div className="fixed top-16 right-4 z-50 w-80">
          <SoundAlertControl />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {getViewIcon()}
            <h1 className="text-6xl font-bold text-white">{getViewTitle()}</h1>
          </div>
          <p className="text-2xl text-slate-300">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {['orders', 'marketplace', 'materials', 'products'].map((view) => (
              <div 
                key={view}
                className={`w-3 h-3 rounded-full ${currentView === view ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>


        {/* Conteúdo Rotativo */}
        {currentView === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Factory className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhuma ordem em produção</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <Card 
                  key={order.id} 
                  className="bg-slate-800 border-2 border-slate-700 shadow-2xl hover:shadow-green-500/20 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl text-white font-bold">
                        {order.order_name}
                      </CardTitle>
                      <Badge className={`${getStatusColor(order.status)} text-white text-sm px-3 py-1`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-400 text-sm">Produto</span>
                      </div>
                      <p className="text-white text-xl font-semibold">{order.product_name}</p>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400 text-sm">Quantidade</span>
                      </div>
                      <p className="text-green-400 text-4xl font-bold">{order.quantity_to_produce}</p>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span className="text-slate-400 text-sm">Data Início</span>
                      </div>
                      <p className="text-white text-lg">
                        {order.start_date ? format(new Date(order.start_date), "dd/MM/yyyy") : "-"}
                      </p>
                    </div>

                    {order.notes && (
                      <div className="bg-slate-900 p-4 rounded-lg">
                        <p className="text-slate-300 text-sm italic">{order.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Materiais para Comprar */}
        {currentView === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Estoque de materiais em dia!</p>
              </div>
            ) : (
              materials.map((material: any) => (
                <Card key={material.id} className="bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-600 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                      <h3 className="text-2xl font-bold text-white mb-2">{material.material_name}</h3>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <p className="text-red-300 text-lg">Estoque Atual</p>
                        <p className="text-4xl font-bold text-white">{material.quantity} {material.unit}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <p className="text-orange-300 text-lg">Necessário</p>
                        <p className="text-3xl font-bold text-white">{material.minimum_quantity} {material.unit}</p>
                      </div>
                      <Badge className="mt-4 bg-red-600 text-white text-lg px-6 py-2">
                        COMPRAR URGENTE
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Pedidos Marketplace */}
        {currentView === 'marketplace' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceOrders.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhum pedido pendente</p>
              </div>
            ) : (
              marketplaceOrders.map((order: any) => (
                <Card 
                  key={order.id} 
                  className="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-600 shadow-2xl"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl text-white font-bold">
                        {order.order_number}
                      </CardTitle>
                      <Badge className="bg-yellow-500 text-white text-sm px-3 py-1">
                        PENDENTE
                      </Badge>
                    </div>
                    <p className="text-purple-200 text-lg">{order.customer_name}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-black/30 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-white text-lg font-semibold">{item.product}</p>
                            <p className="text-green-400 text-2xl font-bold mt-1">
                              Qtd: {item.quantity}
                            </p>
                          </div>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2 mt-3 text-blue-300">
                            <MapPin className="w-4 h-4" />
                            <p className="text-sm">{item.location}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Produtos para Repor */}
        {currentView === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Package className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Estoque de produtos em dia!</p>
              </div>
            ) : (
              products.map((product: any) => (
                <Card key={product.id} className="bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-600 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                      <h3 className="text-2xl font-bold text-white mb-2">{product.product_name}</h3>
                      <p className="text-yellow-200 mb-4">{product.variation_name}</p>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <p className="text-red-300 text-lg">Estoque Atual</p>
                        <p className="text-4xl font-bold text-white">{product.stock_quantity || 0}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <p className="text-yellow-300 text-lg">Estoque Mínimo</p>
                        <p className="text-3xl font-bold text-white">{product.minimum_stock || 0}</p>
                      </div>
                      <Badge className="mt-4 bg-yellow-600 text-white text-lg px-6 py-2">
                        REPOR ESTOQUE
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
