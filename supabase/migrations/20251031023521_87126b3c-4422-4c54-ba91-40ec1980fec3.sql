-- Create materials table
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_name TEXT NOT NULL,
  category TEXT DEFAULT 'materia_prima',
  unit TEXT DEFAULT 'unidade',
  quantity NUMERIC DEFAULT 0,
  minimum_quantity NUMERIC DEFAULT 0,
  unit_cost NUMERIC DEFAULT 0,
  supplier TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'hora_maquina',
  machine_name TEXT,
  hourly_rate NUMERIC DEFAULT 0,
  hours_worked NUMERIC DEFAULT 0,
  client_name TEXT,
  service_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'em_andamento',
  total_value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_orders table
CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_name TEXT NOT NULL,
  product_id UUID,
  product_name TEXT,
  quantity_to_produce INTEGER DEFAULT 1,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  inscricao_estadual TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  cep TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  pis TEXT,
  salary NUMERIC DEFAULT 0,
  admission_date DATE DEFAULT CURRENT_DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  supplier_name TEXT,
  total_value NUMERIC DEFAULT 0,
  issue_date DATE DEFAULT CURRENT_DATE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'maquina',
  model_year TEXT,
  identifier TEXT,
  acquisition_value NUMERIC DEFAULT 0,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  maintenance_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for materials
CREATE POLICY "Authenticated users can view materials" ON public.materials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update materials" ON public.materials FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete materials" ON public.materials FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for services
CREATE POLICY "Authenticated users can view services" ON public.services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create services" ON public.services FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update services" ON public.services FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete services" ON public.services FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for production_orders
CREATE POLICY "Authenticated users can view production orders" ON public.production_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create production orders" ON public.production_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update production orders" ON public.production_orders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete production orders" ON public.production_orders FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for suppliers
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete suppliers" ON public.suppliers FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for employees
CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete employees" ON public.employees FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for invoices
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoices" ON public.invoices FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for assets
CREATE POLICY "Authenticated users can view assets" ON public.assets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update assets" ON public.assets FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete assets" ON public.assets FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON public.production_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();