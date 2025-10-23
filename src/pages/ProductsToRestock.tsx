import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SoundAlertControl } from "@/components/SoundAlertControl";

// Página Exclusiva - Produtos para Repor
export default function ProductsToRestock() {
  const [showControls, setShowControls] = useState(false);
  
  const { data: products = [] } = useQuery({
    queryKey: ['products-restock'],
    queryFn: async () => {
      const data = await base44.entities.Product.list();
      return data.filter((p: any) => (p.stock_quantity || 0) <= (p.minimum_stock || 0));
    },
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-8">
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
            <AlertTriangle className="w-16 h-16 text-yellow-400 animate-pulse" />
            <h1 className="text-6xl font-bold text-white">PRODUTOS PARA REPOR</h1>
          </div>
          <p className="text-2xl text-yellow-200">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })}
          </p>
          <div className="mt-4">
            <Badge className="bg-red-600 text-white text-2xl px-8 py-3">
              {products.length} Produto{products.length !== 1 ? 's' : ''} com Estoque Baixo
            </Badge>
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Package className="w-24 h-24 mx-auto mb-6 text-white/50" />
              <p className="text-3xl text-white">Todos os produtos estão em dia! 🎉</p>
            </div>
          ) : (
            products.map((product: any) => (
              <Card 
                key={product.id} 
                className="bg-gradient-to-br from-yellow-800 to-orange-800 border-4 border-yellow-400 shadow-2xl transform hover:scale-105 transition-transform duration-300"
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
                    
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {product.product_name}
                    </h3>
                    
                    <p className="text-yellow-200 text-xl mb-4">
                      {product.variation_name}
                    </p>

                    {/* Estoque Atual */}
                    <div className="bg-red-900/50 rounded-lg p-6 mb-4 border-2 border-red-500">
                      <p className="text-red-300 text-lg mb-2">ESTOQUE ATUAL</p>
                      <p className="text-6xl font-bold text-white">
                        {product.stock_quantity || 0}
                      </p>
                    </div>

                    {/* Estoque Mínimo */}
                    <div className="bg-yellow-900/50 rounded-lg p-6 mb-4 border-2 border-yellow-500">
                      <p className="text-yellow-300 text-lg mb-2">ESTOQUE MÍNIMO</p>
                      <p className="text-5xl font-bold text-white">
                        {product.minimum_stock || 0}
                      </p>
                    </div>

                    {/* Diferença */}
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <p className="text-orange-300 text-sm mb-1">Necessário Repor</p>
                      <p className="text-3xl font-bold text-orange-400">
                        {Math.max(0, (product.minimum_stock || 0) - (product.stock_quantity || 0))} unidades
                      </p>
                    </div>

                    {/* Preço */}
                    {product.sale_price && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-slate-300 text-sm">Preço de Venda</p>
                        <p className="text-2xl font-bold text-white">
                          R$ {product.sale_price.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <Badge className="mt-4 bg-red-600 text-white text-xl px-8 py-3 animate-pulse">
                      URGENTE - REPOR
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
