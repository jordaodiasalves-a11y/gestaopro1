import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SoundAlertProvider } from "./contexts/SoundAlertContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Materials from "./pages/Materials";
import Services from "./pages/Services";
import Expenses from "./pages/Expenses";
import Production from "./pages/Production";
import ProductionDisplay from "./pages/ProductionDisplay";
import MonitorDisplay from "./pages/MonitorDisplay";
import ProductsToRestock from "./pages/ProductsToRestock";
import MarketplaceOrders from "./pages/MarketplaceOrders";
import Suppliers from "./pages/Suppliers";
import Employees from "./pages/Employees";
import Invoices from "./pages/Invoices";
import Assets from "./pages/Assets";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SoundAlertProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PermissionRoute permission="dashboard"><Layout><Dashboard /></Layout></PermissionRoute>} />
              <Route path="/products" element={<PermissionRoute permission="products"><Layout><Products /></Layout></PermissionRoute>} />
              <Route path="/sales" element={<PermissionRoute permission="sales"><Layout><Sales /></Layout></PermissionRoute>} />
              <Route path="/reports" element={<PermissionRoute permission="reports"><Layout><Reports /></Layout></PermissionRoute>} />
              <Route path="/customers" element={<PermissionRoute permission="customers"><Layout><Customers /></Layout></PermissionRoute>} />
              <Route path="/materials" element={<PermissionRoute permission="materials"><Layout><Materials /></Layout></PermissionRoute>} />
              <Route path="/services" element={<PermissionRoute permission="services"><Layout><Services /></Layout></PermissionRoute>} />
              <Route path="/expenses" element={<PermissionRoute permission="expenses"><Layout><Expenses /></Layout></PermissionRoute>} />
              <Route path="/production" element={<PermissionRoute permission="production"><Layout><Production /></Layout></PermissionRoute>} />
              <Route path="/production-display" element={<ProductionDisplay />} />
              <Route path="/monitor-display" element={<MonitorDisplay />} />
              <Route path="/products-to-restock" element={<ProductsToRestock />} />
              <Route path="/marketplace-orders" element={<PermissionRoute permission="marketplace-orders"><Layout><MarketplaceOrders /></Layout></PermissionRoute>} />
              <Route path="/suppliers" element={<PermissionRoute permission="suppliers"><Layout><Suppliers /></Layout></PermissionRoute>} />
              <Route path="/employees" element={<PermissionRoute permission="employees"><Layout><Employees /></Layout></PermissionRoute>} />
              <Route path="/invoices" element={<PermissionRoute permission="invoices"><Layout><Invoices /></Layout></PermissionRoute>} />
              <Route path="/assets" element={<PermissionRoute permission="assets"><Layout><Assets /></Layout></PermissionRoute>} />
              <Route path="/user-management" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SoundAlertProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
