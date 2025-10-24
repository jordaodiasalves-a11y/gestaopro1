import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag } from "lucide-react";
import { useSoundAlert } from "@/contexts/SoundAlertContext";

interface MarketplaceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  items: { product: string; quantity: number; location?: string }[];
  status: "pendente" | "separando" | "concluido" | "concluído";
  created_date?: string;
  created_at?: string;
}

// Slide V2 - copia a lógica da página MarketplaceOrders (pendentes)
export default function MarketplaceSlideV2() {
  const { playAlert, alertMode } = useSoundAlert();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["monitor-marketplace-orders-v2"],
    queryFn: async () => {
      try {
        const raw = localStorage.getItem("marketplace_orders");
        const parsed = raw ? (JSON.parse(raw) as MarketplaceOrder[]) : [];
        const pending = parsed.filter(o => o.status !== "concluido" && o.status !== "concluído");
        return pending.sort((a, b) => {
          const tA = new Date(a.created_at || a.created_date || '').getTime();
          const tB = new Date(b.created_at || b.created_date || '').getTime();
          return tB - tA;
        });
      } catch {
        return [] as MarketplaceOrder[];
      }
    },
    refetchInterval: 5000,
  });

  // Alerta de novos pedidos - simples, mesmo padrão da página
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const key = 'mp_v2_last_check';
    const last = localStorage.getItem(key);
    const lastTime = last ? new Date(last).getTime() : 0;
    const newOnes = orders.filter(o => new Date(o.created_at || o.created_date || '').getTime() > lastTime);
    if (newOnes.length > 0 && alertMode === 'on-order') {
      playAlert('new-order');
    }
    localStorage.setItem(key, new Date().toISOString());
  }, [dataUpdatedAt, orders, alertMode, playAlert]);

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
      {orders.map((order) => (
        <Card 
          key={order.id}
          className="bg-slate-800 border-2 border-slate-700 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
        >
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl text-white font-bold flex items-center gap-3">
                {order.order_number}
              </CardTitle>
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">Pendente</Badge>
            </div>
            <p className="text-slate-200 text-xl mt-2">{order.customer_name}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white text-xl font-semibold">{item.product}</p>
                      <p className="text-green-400 text-2xl font-bold mt-1">Qtd: {item.quantity}</p>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
