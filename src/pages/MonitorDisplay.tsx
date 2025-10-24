import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Cake, AlertCircle, TrendingUp, DollarSign, Package, BarChart2, Wrench, Factory as FactoryIcon, ShoppingBag } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SoundAlertControl } from "@/components/SoundAlertControl";
import { useSoundAlert } from "@/contexts/SoundAlertContext";
import MarketplaceSlide from "@/components/monitor/MarketplaceSlide";
import { initializeMarketplaceStorage } from "@/utils/marketplaceSync";

type ViewType = 'purchases' | 'birthdays' | 'expenses' | 'reports' | 'top_products' | 'production_alerts' | 'accounts_payable' | 'sales_summary' | 'inventory_status' | 'services_summary' | 'marketplace';

// Monitor Externo GESTÃO - Rotação Automática com 10 telas
export default function MonitorDisplay() {
  const [currentView, setCurrentView] = useState<ViewType>("purchases");
  const [showControls, setShowControls] = useState(false);
  const [selectedManualAudio, setSelectedManualAudio] = useState<string>(() => localStorage.getItem('preferred_alert_manual_audio') || "1");
  const { playAlert, playManualAudio } = useSoundAlert();

  const views: ViewType[] = [
    'purchases',
    'production_alerts',
    'marketplace',
    'birthdays',
    'expenses',
    'accounts_payable',
    'top_products',
    'sales_summary',
    'services_summary',
    'inventory_status',
    'reports'
  ];
  
  // Inicializar marketplace storage
  useEffect(() => {
    initializeMarketplaceStorage();
  }, []);
  // Rotação automática a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => {
        const currentIndex = views.indexOf(prev);
        const nextIndex = (currentIndex + 1) % views.length;
        return views[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [views]);

  // Persistir áudio manual preferido para alertas automáticos
  useEffect(() => {
    localStorage.setItem('preferred_alert_manual_audio', selectedManualAudio);
  }, [selectedManualAudio]);

  const { data: materials = [] } = useQuery({
    queryKey: ['materials-monitor'],
    queryFn: async () => {
      const data = await base44.entities.Material.list();
      return data.filter((m: any) => m.quantity <= m.minimum_quantity);
    },
    refetchInterval: 5000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-monitor'],
    queryFn: async () => {
      const data = await base44.entities.Product.list();
      return data.filter((p: any) => (p.stock_quantity || 0) <= (p.minimum_stock || 0));
    },
    refetchInterval: 5000,
  });

  const { data: productionOrders = [] } = useQuery({
    queryKey: ['production-orders-monitor'],
    queryFn: async () => {
      const data = await base44.entities.ProductionOrder.list();
      return data.filter((order: any) => order.status !== "concluido");
    },
    refetchInterval: 5000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-monitor'],
    queryFn: async () => {
      const data = await base44.entities.Employee.list();
      const today = new Date();
      return data.filter((emp: any) => {
        if (!emp.birth_date) return false;
        const birthDate = parseISO(emp.birth_date);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysUntil = differenceInDays(thisYearBirthday, today);
        return daysUntil >= 0 && daysUntil <= 30;
      }).sort((a: any, b: any) => {
        const dateA = parseISO(a.birth_date);
        const dateB = parseISO(b.birth_date);
        const todayA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
        const todayB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
        return differenceInDays(todayA, today) - differenceInDays(todayB, today);
      });
    },
    refetchInterval: 5000,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-monitor'],
    queryFn: async () => {
      const data = await base44.entities.Expense.list();
      const today = new Date();
      return data.filter((exp: any) => {
        if (!exp.due_date || exp.status === 'paid') return false;
        const dueDate = parseISO(exp.due_date);
        const daysUntil = differenceInDays(dueDate, today);
        return daysUntil >= -2 && daysUntil <= 7;
      }).sort((a: any, b: any) => {
        return differenceInDays(parseISO(a.due_date), parseISO(b.due_date));
      });
    },
    refetchInterval: 5000,
  });

  const { data: allExpenses = [] } = useQuery({
    queryKey: ['all-expenses-monitor'],
    queryFn: () => base44.entities.Expense.list(),
    refetchInterval: 5000,
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ['sales-monitor'],
    queryFn: () => base44.entities.Sale.list(),
    refetchInterval: 5000,
  });

  const { data: servicesData = [] } = useQuery({
    queryKey: ['services-monitor'],
    queryFn: () => base44.entities.Service.list(),
    refetchInterval: 5000,
  });

  const { data: allMaterials = [] } = useQuery({
    queryKey: ['all-materials-monitor'],
    queryFn: () => base44.entities.Material.list(),
    refetchInterval: 5000,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-monitor'],
    queryFn: () => base44.entities.Product.list(),
    refetchInterval: 5000,
  });

  const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.total_revenue || 0), 0);
  const totalProfit = salesData.reduce((sum: number, sale: any) => sum + (sale.total_profit || 0), 0);
  const totalExpenses = allExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
  const totalServices = servicesData.reduce((sum: number, service: any) => sum + (service.total_value || 0), 0);

  // Top produtos mais vendidos
  const productSales: Record<string, number> = {};
  salesData.forEach((sale: any) => {
    if (!productSales[sale.product_name]) {
      productSales[sale.product_name] = 0;
    }
    productSales[sale.product_name] += sale.quantity || 0;
  });

  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const getViewTitle = () => {
    switch(currentView) {
      case 'purchases': return 'LISTA DE COMPRAS';
      case 'production_alerts': return 'ALERTAS DE PRODUÇÃO';
      case 'marketplace': return 'PEDIDOS MARKETPLACE';
      case 'birthdays': return 'ANIVERSARIANTES';
      case 'expenses': return 'PAGAMENTOS URGENTES';
      case 'reports': return 'RESUMO FINANCEIRO';
      case 'top_products': return 'PRODUTOS MAIS VENDIDOS';
      case 'accounts_payable': return 'CONTAS A PAGAR';
      case 'sales_summary': return 'RESUMO DE VENDAS';
      case 'inventory_status': return 'STATUS DE ESTOQUE COMPLETO';
      case 'services_summary': return 'RESUMO DE SERVIÇOS';
    }
  };
  const getViewIcon = () => {
    switch(currentView) {
      case 'purchases': return <ShoppingCart className="w-16 h-16 text-orange-400" />;
      case 'production_alerts': return <FactoryIcon className="w-16 h-16 text-purple-400" />;
      case 'marketplace': return <ShoppingBag className="w-16 h-16 text-purple-400" />;
      case 'birthdays': return <Cake className="w-16 h-16 text-pink-400" />;
      case 'expenses': return <AlertCircle className="w-16 h-16 text-red-400" />;
      case 'reports': return <TrendingUp className="w-16 h-16 text-green-400" />;
      case 'top_products': return <BarChart2 className="w-16 h-16 text-blue-400" />;
      case 'accounts_payable': return <DollarSign className="w-16 h-16 text-yellow-400" />;
      case 'sales_summary': return <TrendingUp className="w-16 h-16 text-emerald-400" />;
      case 'inventory_status': return <Package className="w-16 h-16 text-cyan-400" />;
      case 'services_summary': return <Wrench className="w-16 h-16 text-indigo-400" />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      {/* Botões de controles flutuante */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap max-w-xl">
        <button
          onClick={() => playAlert()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          🔊 Testar Som
        </button>
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all"
        >
          {showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
        </button>
        
        {/* Seletor e botão de áudio manual */}
        <div className="flex gap-2 items-center bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <select 
            value={selectedManualAudio}
            onChange={(e) => setSelectedManualAudio(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded border border-white/20 focus:outline-none focus:border-purple-400"
          >
            {[1, 2, 3, 4, 5].map((num) => {
              const label = localStorage.getItem(`manual_audio_${num}_label`) || `Áudio ${num}`;
              const hasAudio = localStorage.getItem(`manual_audio_${num}`);
              if (!hasAudio) return null;
              
              return (
                <option key={num} value={num.toString()}>
                  {label}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => playManualAudio(selectedManualAudio)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
          >
            ▶ START
          </button>
        </div>
      </div>

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
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {views.map((view) => (
              <div 
                key={view}
                className={`w-3 h-3 rounded-full ${currentView === view ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        {currentView === 'purchases' && (
          <div className="space-y-8">
            {materials.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Estoque de materiais em dia!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material: any) => (
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
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'production_alerts' && (
          <div className="space-y-8">
            {productionOrders.length === 0 ? (
              <div className="text-center py-20">
                <FactoryIcon className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhuma ordem de produção pendente!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productionOrders.map((order: any) => (
                  <Card key={order.id} className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-600 shadow-2xl">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FactoryIcon className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                        <h3 className="text-2xl font-bold text-white mb-2">{order.order_name}</h3>
                        <p className="text-purple-200 mb-4">{order.product_name}</p>
                        <div className="bg-black/30 rounded-lg p-4 mb-4">
                          <p className="text-red-300 text-lg">Quantidade a Produzir</p>
                          <p className="text-4xl font-bold text-white">{order.quantity_to_produce}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4">
                          <p className="text-pink-300 text-lg">Status</p>
                          <p className="text-3xl font-bold text-white">{order.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'marketplace' && (
          <div className="space-y-8">
            <MarketplaceSlide />
          </div>
        )}

        {currentView === 'birthdays' && (
          <div className="space-y-8">
            {employees.length === 0 ? (
              <div className="text-center py-20">
                <Cake className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhum aniversariante no próximo mês!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee: any) => {
                  const birthDate = parseISO(employee.birth_date);
                  const today = new Date();
                  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                  const daysUntil = differenceInDays(thisYearBirthday, today);

                  return (
                    <Card key={employee.id} className="bg-gradient-to-br from-pink-900 to-red-900 border-2 border-pink-600 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Cake className="w-16 h-16 mx-auto mb-4 text-pink-300" />
                          <h3 className="text-2xl font-bold text-white mb-2">{employee.name}</h3>
                          <p className="text-pink-200 mb-4">
                            Aniversário em {format(birthDate, "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-red-300 text-lg">Faltam</p>
                            <p className="text-4xl font-bold text-white">{daysUntil} dias</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'expenses' && (
          <div className="space-y-8">
            {expenses.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhuma conta pendente!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenses.map((expense: any) => {
                  const dueDate = parseISO(expense.due_date);
                  const daysUntil = differenceInDays(dueDate, new Date());

                  let urgency = "Em Dia";
                  let urgencyColor = "text-green-300";

                  if (daysUntil < 0) {
                    urgency = "Urgente";
                    urgencyColor = "text-red-300";
                  } else if (daysUntil <= 2) {
                    urgency = "Próximo";
                    urgencyColor = "text-yellow-300";
                  }

                  return (
                    <Card key={expense.id} className="bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-600 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
                          <h3 className="text-2xl font-bold text-white mb-2">{expense.description}</h3>
                          <p className="text-orange-200 mb-4">
                            Vencimento em {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-red-300 text-lg">Valor</p>
                            <p className="text-4xl font-bold text-white">R$ {expense.amount}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className={urgencyColor + " text-lg"}>Status</p>
                            <p className="text-3xl font-bold text-white">{urgency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'reports' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Receita Total</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900 to-cyan-900 border-2 border-blue-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Lucro Total</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalProfit.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-900 to-orange-900 border-2 border-red-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-red-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Despesas Totais</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalExpenses.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Total de Serviços</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalServices.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'top_products' && (
          <div className="space-y-8">
            {topProducts.length === 0 ? (
              <div className="text-center py-20">
                <BarChart2 className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhum produto vendido!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProducts.map((product, index) => (
                  <Card key={index} className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-600 shadow-2xl">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                        <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                        <p className="text-purple-200 mb-4">Quantidade Vendida</p>
                        <p className="text-4xl font-bold text-white">{product.quantity}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'accounts_payable' && (
          <div className="space-y-8">
            {expenses.length === 0 ? (
              <div className="text-center py-20">
                <DollarSign className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhuma conta a pagar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenses.map((expense: any) => {
                  const dueDate = parseISO(expense.due_date);
                  const daysUntil = differenceInDays(dueDate, new Date());

                  return (
                    <Card key={expense.id} className="bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-600 shadow-2xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <DollarSign className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                          <h3 className="text-2xl font-bold text-white mb-2">{expense.description}</h3>
                          <p className="text-orange-200 mb-4">
                            Vencimento em {format(dueDate, "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <p className="text-red-300 text-lg">Valor</p>
                            <p className="text-4xl font-bold text-white">R$ {expense.amount}</p>
                          </div>
                          <p className="text-yellow-200 text-lg italic">
                            {daysUntil >= 0 ? `Faltam ${daysUntil} dias` : `Venceu há ${Math.abs(daysUntil)} dias`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'sales_summary' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-emerald-900 to-green-900 border-2 border-emerald-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Vendas Totais</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900 to-lime-900 border-2 border-green-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Lucro Total</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalProfit.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'inventory_status' && (
          <div className="space-y-8">
            {allProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-24 h-24 mx-auto mb-6 text-slate-600" />
                <p className="text-3xl text-slate-400">Nenhum produto cadastrado!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProducts.map((product: any) => (
                  <Card key={product.id} className="bg-gradient-to-br from-cyan-900 to-blue-900 border-2 border-cyan-600 shadow-2xl">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-cyan-300" />
                        <h3 className="text-2xl font-bold text-white mb-2">{product.product_name}</h3>
                        <p className="text-blue-200 mb-4">{product.variation_name}</p>
                        <div className="bg-black/30 rounded-lg p-4 mb-4">
                          <p className="text-red-300 text-lg">Estoque Atual</p>
                          <p className="text-4xl font-bold text-white">{product.stock_quantity || 0}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4">
                          <p className="text-cyan-300 text-lg">Estoque Mínimo</p>
                          <p className="text-3xl font-bold text-white">{product.minimum_stock || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'services_summary' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 border-2 border-indigo-600 shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Total de Serviços</h3>
                    <p className="text-4xl font-bold text-white">R$ {totalServices.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
