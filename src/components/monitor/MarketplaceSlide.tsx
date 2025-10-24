import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag } from "lucide-react";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import { getPendingOrders, initializeMarketplaceStorage } from "@/utils/marketplaceSync";

export default function MarketplaceSlide() {
  const { playAlert, alertMode } = useSoundAlert();

  // Inicializar storage
  useEffect(() => {
    initializeMarketplaceStorage();
  }, []);

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["monitor-marketplace-orders"],
    queryFn: async () => {
      const pending = getPendingOrders();
      // Ordenar por data de criação (mais recentes primeiro)
      return pending.sort((a, b) => {
        const dateA = new Date(a.created_at || a.created_date).getTime();
        const dateB = new Date(b.created_at || b.created_date).getTime();
        return dateB - dateA;
      });
    },
    refetchInterval: 5000,
  });

  // Tocar alerta quando novos pedidos chegarem (sincronizado com MarketplaceOrders)
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    const lastCheckKey = "marketplace_monitor_last_check";
    const lastCheck = localStorage.getItem(lastCheckKey);
    const lastCheckTime = lastCheck ? new Date(lastCheck).getTime() : 0;
    
    const newOrders = orders.filter((o: any) => {
      const orderTime = new Date(o.created_at || o.created_date || o.createdAt || '').getTime();
      return orderTime > lastCheckTime;
    });
    
    if (newOrders.length > 0 && alertMode === "on-order") {
      console.log("🔔 Monitor: Novos pedidos marketplace:", newOrders.length);
      playAlert('new-order');
    }
    
    localStorage.setItem(lastCheckKey, new Date().toISOString());
  }, [dataUpdatedAt, alertMode, playAlert]);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-slate-600" />
        <p className="text-3xl text-slate-400">Nenhum pedido pendente</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order: any) => (
        <Card key={order.id} className="bg-slate-800 border-2 border-slate-700 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white font-bold">{order.order_number}</CardTitle>
              <Badge className="bg-yellow-500 text-white">Pendente</Badge>
            </div>
            <p className="text-slate-300">{order.customer_name}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-black/30 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-lg font-semibold">{item.product}</p>
                    <p className="text-green-400 text-2xl font-bold mt-1">Qtd: {item.quantity}</p>
                  </div>
                </div>
                {item.location && (
                  <div className="flex items-center gap-2 mt-1 text-blue-300">
                    <MapPin className="w-4 h-4" />
                    <p className="text-sm">{item.location}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
