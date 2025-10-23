import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BarChart2,
  Package,
  ShoppingCart,
  Wrench,
  Receipt,
  FileText,
  Users,
  UserCog,
  FileDigit,
  Car,
  Truck,
  Factory,
  ShoppingBag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Relatórios", url: createPageUrl("Reports"), icon: BarChart2 },
  { title: "Produção", url: createPageUrl("Production"), icon: Factory },
  { title: "Pedidos Marketplace", url: "/marketplace-orders", icon: ShoppingBag },
  { title: "Produtos", url: createPageUrl("Products"), icon: Package },
  { title: "Serviços", url: createPageUrl("Services"), icon: Wrench },
  { title: "Despesas", url: createPageUrl("Expenses"), icon: Receipt },
  { title: "Vendas", url: createPageUrl("Sales"), icon: ShoppingCart },
  { title: "Estoque", url: createPageUrl("Materials"), icon: FileText },
  { title: "Fornecedores", url: createPageUrl("Suppliers"), icon: Truck },
  { title: "Clientes", url: createPageUrl("Customers"), icon: Users },
  { title: "Funcionários", url: createPageUrl("Employees"), icon: UserCog },
  { title: "Notas Fiscais", url: createPageUrl("Invoices"), icon: FileDigit },
  { title: "Máquinas e Veículos", url: createPageUrl("Assets"), icon: Car },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className={`no-print border-r border-slate-200 bg-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
          <SidebarHeader className="border-b border-slate-200 p-4">
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Gestão PRO</h2>
                    <p className="text-xs text-slate-500">Sociedade</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(true)}
                  className="hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(false)}
                  className="hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Menu
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:text-white hover:from-blue-700 hover:to-green-700 shadow-md' : ''
                        } ${collapsed ? 'justify-center px-2' : 'px-4'}`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 py-2.5">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-2">
            {user?.role === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`hover:bg-blue-50 hover:text-blue-700 rounded-lg mb-1 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
                  <Link to="/user-management" className="flex items-center gap-3 py-2.5">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">Usuários</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={logout}
                className={`hover:bg-red-50 hover:text-red-700 rounded-lg ${collapsed ? 'justify-center px-2' : 'px-4'}`}
              >
                <div className="flex items-center gap-3 py-2.5 w-full">
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium text-sm">Sair</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="no-print bg-white border-b border-slate-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">Gestão PRO</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto printable-area">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
