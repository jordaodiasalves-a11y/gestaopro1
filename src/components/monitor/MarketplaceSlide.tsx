import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag } from "lucide-react";
import { useSoundAlert } from "@/contexts/SoundAlertContext";

export default function MarketplaceSlide() {
  const { playAlert, alertMode } = useSoundAlert();

  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["monitor-marketplace-orders"],
    queryFn: async () => {
      try {
        const raw = localStorage.getItem("marketplace_orders");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((o: any) => o.status !== "concluido") : [];
      } catch {
        return [] as any[];
      }
    },
    refetchInterval: 5000,
  });

  // Tocar som somente quando chegarem novos pedidos
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const lastKey = "marketplace_last_check_monitor";
    const last = localStorage.getItem(lastKey);
    const lastTime = last ? new Date(last).getTime() : 0;
    const newOnes = orders.filter((o: any) => new Date(o.created_at || o.created_date).getTime() > lastTime);
    if (newOnes.length > 0 && (alertMode === "on-order" || alertMode === "interval")) {
      playAlert();
    }
    localStorage.setItem(lastKey, new Date().toISOString());
  }, [dataUpdatedAt]);

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
