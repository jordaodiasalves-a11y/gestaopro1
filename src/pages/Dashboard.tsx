import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DollarSign, TrendingUp, ShoppingCart, Wrench, AlertTriangle, BarChart2, Receipt, ChevronRight, Monitor } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import AISearch from "../components/dashboard/AISearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export default function Dashboard() {
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const data = await base44.entities.Sale.list();
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.sale_date).getTime();
        const dateB = new Date(b.created_date || b.sale_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const data = await base44.entities.Service.list();
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.service_date).getTime();
        const dateB = new Date(b.created_date || b.service_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: () => base44.entities.Material.list(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const data = await base44.entities.Expense.list();
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.payment_date).getTime();
        const dateB = new Date(b.created_date || b.payment_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const today = new Date();
  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);

  const currentMonthSales = sales.filter(s => s.sale_date && isWithinInterval(new Date(s.sale_date), { start: startOfCurrentMonth, end: endOfCurrentMonth }));
  const currentMonthServices = services.filter(s => s.service_date && isWithinInterval(new Date(s.service_date), { start: startOfCurrentMonth, end: endOfCurrentMonth }));
  const currentMonthExpenses = expenses.filter(e => e.payment_date && isWithinInterval(new Date(e.payment_date), { start: startOfCurrentMonth, end: endOfCurrentMonth }));

  const currentMonthSalesRevenue = currentMonthSales.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const currentMonthServicesRevenue = currentMonthServices.reduce((sum, s) => sum + (s.total_value || 0), 0);
  const currentMonthTotalExpenses = currentMonthExpenses.reduce((sum, e) => sum + (e.value || 0), 0);
  const currentMonthTotalRevenue = currentMonthSalesRevenue + currentMonthServicesRevenue;
  const currentMonthProfit = currentMonthSales.reduce((sum, s) => sum + (s.total_profit || 0), 0) - currentMonthTotalExpenses;

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_revenue || 0), 0);
  const servicesRevenue = services.reduce((sum, s) => sum + (s.total_value || 0), 0);
  const totalRevenueWithServices = totalRevenue + servicesRevenue;
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.value || 0), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) - totalExpenses;

  const lowStockMaterials = materials.filter(m => (m.quantity || 0) <= (m.minimum_quantity || 0));

  const productSales: Record<string, number> = {};
  sales.forEach(sale => {
    if (!productSales[sale.product_name]) {
      productSales[sale.product_name] = 0;
    }
    productSales[sale.product_name] += sale.quantity || 0;
  });

  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const recentSales = sales.slice(0, 5);
  const recentServices = services.slice(0, 3);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Visão geral do seu negócio em tempo real</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.open('/products-to-restock', 'ProductsRestock', 'width=1920,height=1080');
                  toast.success("Monitor de produtos aberto!");
                }}
                variant="outline"
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Monitor Produtos
              </Button>
              <Button
                onClick={() => {
                  window.open('/production-display', 'ProductionDisplay', 'width=1920,height=1080');
                  toast.success("Monitor de produção aberto!");
                }}
                variant="outline"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Monitor Produção
              </Button>
              <Button
                onClick={() => {
                  window.open('/monitor-display', 'MonitorDisplay', 'width=1920,height=1080');
                  toast.success("Monitor de gestão aberto!");
                }}
                variant="outline"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Monitor Gestão
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AISearch />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Receita Total (Geral)"
            value={`R$ ${totalRevenueWithServices.toFixed(2)}`}
            icon={DollarSign}
            bgColor="bg-green-500"
          />
          <StatsCard
            title="Lucro Líquido (Geral)"
            value={`R$ ${totalProfit.toFixed(2)}`}
            icon={TrendingUp}
            bgColor="bg-blue-500"
          />
          <StatsCard
            title="Total Despesas (Geral)"
            value={`R$ ${totalExpenses.toFixed(2)}`}
            icon={Receipt}
            bgColor="bg-red-500"
          />
          <StatsCard
            title="Produtos Cadastrados"
            value={products.length}
            icon={TrendingUp}
            bgColor="bg-orange-500"
          />
        </div>

        <Card className="shadow-lg border-0 mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6" />
              Resumo de {format(new Date(), 'MMMM', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Receita do Mês</p>
                  <p className="text-3xl font-bold">R$ {currentMonthTotalRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Despesas do Mês</p>
                  <p className="text-3xl font-bold">R$ {currentMonthTotalExpenses.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Lucro Líquido do Mês</p>
                  <p className="text-3xl font-bold">R$ {currentMonthProfit.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Link to={createPageUrl("Reports")}>
                  <Button variant="secondary" size="lg" className="shadow-lg">
                    Ver Relatório Completo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {lowStockMaterials.length > 0 && (
          <Card className="shadow-lg border-0 border-l-4 border-l-orange-500 mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-orange-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alerta: {lowStockMaterials.length} Materiais com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {lowStockMaterials.slice(0, 4).map((material) => (
                  <div key={material.id} className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-semibold text-slate-900">{material.material_name}</p>
                    <p className="text-sm text-slate-600">Estoque: {material.quantity} (Mín: {material.minimum_quantity})</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopProductsChart data={topProducts} />
          </div>

          <div className="space-y-6">
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="p-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-slate-900">Vendas Recentes</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <div key={sale.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{sale.product_name}</p>
                          <span className="text-green-600 font-bold text-sm">R$ {sale.total_revenue?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>Qtd: {sale.quantity}</span>
                          <span>Lucro: R$ {sale.total_profit?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma venda registrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="p-6">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-slate-900">Serviços Recentes</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {recentServices.length > 0 ? (
                    recentServices.map((service) => (
                      <div key={service.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{service.service_name}</p>
                          <span className="text-purple-600 font-bold text-sm">R$ {service.total_value?.toFixed(2)}</span>
                        </div>
                        {service.machine_name && (
                          <p className="text-xs text-slate-600">{service.machine_name}</p>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          {service.hours_worked}h × R$ {service.hourly_rate?.toFixed(2)}/h
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum serviço registrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
