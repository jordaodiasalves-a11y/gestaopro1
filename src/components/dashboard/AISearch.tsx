import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Sparkles, Settings, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { base44 } from "@/api/base44Client";

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string>("");
  const [matchedProductIds, setMatchedProductIds] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    toast({ title: "API Key salva com sucesso!" });
  };

  const searchInternalData = async (query: string) => {
    const [products, sales, services, materials] = await Promise.all([
      base44.entities.Product.list(),
      base44.entities.Sale.list(),
      base44.entities.Service.list(),
      base44.entities.Material.list(),
    ]);

    const allData = {
      produtos: products,
      vendas: sales,
      servicos: services,
      materiais: materials
    };

    const queryLower = query.toLowerCase();
    let results = "📊 Resultados da busca:\n\n";
    const foundProductIds: string[] = [];

    // Buscar em produtos
    const matchingProducts = products.filter((p: any) => 
      p.product_name?.toLowerCase().includes(queryLower) ||
      p.variation_name?.toLowerCase().includes(queryLower)
    );
    if (matchingProducts.length > 0) {
      results += `🛍️ Produtos (${matchingProducts.length}):\n`;
      matchingProducts.slice(0, 3).forEach((p: any) => {
        foundProductIds.push(p.id);
        results += `• ${p.product_name} - ${p.variation_name} - R$ ${p.sale_price?.toFixed(2)} (Estoque: ${p.stock_quantity || 0}) [Clique para ver em Produção]\n`;
      });
      results += "\n";
    }

    // Buscar em vendas
    const matchingSales = sales.filter((s: any) => 
      s.product_name?.toLowerCase().includes(queryLower) ||
      s.customer_name?.toLowerCase().includes(queryLower)
    );
    if (matchingSales.length > 0) {
      results += `💰 Vendas (${matchingSales.length}):\n`;
      matchingSales.slice(0, 3).forEach((s: any) => {
        results += `• ${s.product_name || 'Sem nome'} - Cliente: ${s.customer_name || 'N/A'} - R$ ${s.total_revenue?.toFixed(2)}\n`;
      });
      results += "\n";
    }

    // Buscar em serviços
    const matchingServices = services.filter((s: any) => 
      s.service_name?.toLowerCase().includes(queryLower) ||
      s.client_name?.toLowerCase().includes(queryLower)
    );
    if (matchingServices.length > 0) {
      results += `🔧 Serviços (${matchingServices.length}):\n`;
      matchingServices.slice(0, 3).forEach((s: any) => {
        results += `• ${s.service_name} - Cliente: ${s.client_name || 'N/A'} - R$ ${s.total_value?.toFixed(2)}\n`;
      });
      results += "\n";
    }

    // Buscar em materiais
    const matchingMaterials = materials.filter((m: any) => 
      m.material_name?.toLowerCase().includes(queryLower)
    );
    if (matchingMaterials.length > 0) {
      results += `📦 Materiais (${matchingMaterials.length}):\n`;
      matchingMaterials.slice(0, 3).forEach((m: any) => {
        const status = m.quantity <= m.minimum_quantity ? '⚠️ Estoque baixo' : '✓ OK';
        results += `• ${m.material_name} - ${m.quantity} ${m.unit} - ${status}\n`;
      });
      results += "\n";
    }

    if (!matchingProducts.length && !matchingSales.length && !matchingServices.length && !matchingMaterials.length) {
      results = "❌ Nenhum resultado encontrado para: " + query;
    }

    setMatchedProductIds(foundProductIds);
    return results;
  };

  const searchWithAI = async (query: string) => {
    if (!apiKey) {
      toast({ 
        title: "Configure a API Key", 
        description: "Por favor, configure sua chave da API Gemini nas configurações.",
        variant: "destructive" 
      });
      return;
    }

    const [products, sales, services, materials, expenses] = await Promise.all([
      base44.entities.Product.list(),
      base44.entities.Sale.list(),
      base44.entities.Service.list(),
      base44.entities.Material.list(),
      base44.entities.Expense.list(),
    ]);

    const context = `Dados do sistema:
Produtos: ${JSON.stringify(products.slice(0, 10))}
Vendas: ${JSON.stringify(sales.slice(0, 10))}
Serviços: ${JSON.stringify(services.slice(0, 10))}
Materiais: ${JSON.stringify(materials.slice(0, 10))}
Despesas: ${JSON.stringify(expenses.slice(0, 10))}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${context}\n\nPergunta do usuário: ${query}\n\nResponda de forma clara e concisa baseado nos dados fornecidos.`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar resposta da IA";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults("");

    try {
      const result = useAI 
        ? await searchWithAI(query)
        : await searchInternalData(query);
      
      setSearchResults(result);
      toast({ title: "Busca concluída!" });
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({ 
        title: "Erro na busca", 
        description: "Ocorreu um erro ao realizar a busca.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Pesquisa Inteligente</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="ai-mode"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label htmlFor="ai-mode" className="text-sm text-white cursor-pointer">
                  {useAI ? "IA Ativada" : "Busca Normal"}
                </Label>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Configurações da IA</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">Gemini API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua API key aqui..."
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        Obtenha sua chave em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>
                      </p>
                    </div>
                    <Button onClick={saveApiKey} className="w-full">
                      Salvar API Key
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={useAI ? "Pergunte qualquer coisa sobre seus dados..." : "Buscar produtos, vendas, serviços..."}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
              <Button type="submit" variant="secondary" className="px-6" disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {searchResults && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg text-white space-y-2">
                <div className="whitespace-pre-wrap text-sm">{searchResults}</div>
                {matchedProductIds.length > 0 && (
                  <Button
                    onClick={() => navigate(`/production?product=${matchedProductIds[0]}`)}
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Ver em Ordens de Produção
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
