import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "../components/dashboard/StatsCard";
import { DollarSign, TrendingUp, Wrench, Receipt, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { startOfMonth, endOfMonth, isWithinInterval, format, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportData, setReportData] = useState<any>(null);

  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => base44.entities.Sale.list() });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.Service.list() });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list() });

  useEffect(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    const monthlySales = sales.filter((s: any) => s.sale_date && isWithinInterval(new Date(s.sale_date), { start, end }));
    const monthlyServices = services.filter((s: any) => s.service_date && isWithinInterval(new Date(s.service_date), { start, end }));
    const monthlyExpenses = expenses.filter((e: any) => e.expense_date && isWithinInterval(new Date(e.expense_date), { start, end }));

    const salesRevenue = monthlySales.reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0);
    const servicesRevenue = monthlyServices.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);
    const totalExpenses = monthlyExpenses.reduce((sum: number, e: any) => sum + (e.value || 0), 0);
    
    const netProfit = (salesRevenue + servicesRevenue) - totalExpenses - monthlySales.reduce((sum: number, s: any) => sum + (s.total_cost || 0), 0);

    const dailyData = eachDayOfInterval({ start, end }).map(day => {
      const dayStr = format(day, 'dd/MM');
      
      const salesForDay = monthlySales.filter((s: any) => s.sale_date && format(new Date(s.sale_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      const servicesForDay = monthlyServices.filter((s: any) => s.service_date && format(new Date(s.service_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      const expensesForDay = monthlyExpenses.filter((e: any) => e.expense_date && format(new Date(e.expense_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      
      const dailyRevenue = salesForDay.reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0) + servicesForDay.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);
      const dailyCostOfGoods = salesForDay.reduce((sum: number, s: any) => sum + (s.total_cost || 0), 0);
      const dailyExpenses = expensesForDay.reduce((sum: number, e: any) => sum + (e.value || 0), 0);

      return {
        name: dayStr,
        Receita: dailyRevenue,
        'Lucro Líquido': dailyRevenue - dailyCostOfGoods - dailyExpenses,
      };
    });

    const productPerformance = monthlySales.reduce((acc: any, sale: any) => {
      if (!acc[sale.product_name]) {
        acc[sale.product_name] = { name: sale.product_name, Receita: 0 };
      }
      acc[sale.product_name].Receita += sale.total_revenue || 0;
      return acc;
    }, {});

    const topProducts = Object.values(productPerformance).sort((a: any, b: any) => b.Receita - a.Receita).slice(0, 5);
    
    setReportData({
      salesRevenue,
      servicesRevenue,
      totalRevenue: salesRevenue + servicesRevenue,
      totalExpenses,
      netProfit,
      dailyData,
      topProducts,
      totalSales: monthlySales.length,
      totalServices: monthlyServices.length,
    });

  }, [selectedDate, sales, services, expenses]);

  if (!reportData) {
    return <div className="p-8">Carregando relatórios...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="printable-page-title hidden">Relatório Mensal - {format(selectedDate, "MMMM yyyy", { locale: ptBR })}</div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatórios Mensais</h1>
            <p className="text-slate-600">Análise detalhada do desempenho do seu negócio</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Relatório
          </Button>
        </div>

        <div className="no-print mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Filtros do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setSelectedDate(subMonths(selectedDate, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[200px] text-center">
                  {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <Button variant="outline" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                  Este Mês
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Receita Total" value={`R$ ${reportData.totalRevenue.toFixed(2)}`} icon={DollarSign} bgColor="bg-green-500" />
          <StatsCard title="Despesas Totais" value={`R$ ${reportData.totalExpenses.toFixed(2)}`} icon={Receipt} bgColor="bg-red-500" />
          <StatsCard title="Lucro Líquido" value={`R$ ${reportData.netProfit.toFixed(2)}`} icon={TrendingUp} bgColor="bg-blue-500" />
          <StatsCard title="Receita de Serviços" value={`R$ ${reportData.servicesRevenue.toFixed(2)}`} icon={Wrench} bgColor="bg-purple-500" />
        </div>

        <div className="grid lg:grid-cols-1 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução Diária de Receita e Lucro Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={reportData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Lucro Líquido" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos (por Receita)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="Receita" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
