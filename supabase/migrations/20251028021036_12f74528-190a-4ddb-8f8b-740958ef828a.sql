-- Fix RLS policies to require authentication for sensitive tables

-- 1. CUSTOMERS TABLE - Contains PII (emails, phones, addresses, documents)
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;

-- Require authentication for all operations
CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create customers"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customers"
ON public.customers FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete customers"
ON public.customers FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. SALES TABLE - Contains business intelligence and revenue data
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;

-- Require authentication for all operations
CREATE POLICY "Authenticated users can view sales"
ON public.sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sales"
ON public.sales FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sales"
ON public.sales FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 3. MARKETPLACE_ORDERS TABLE - Contains customer data and order details
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view marketplace orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Anyone can insert marketplace orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Anyone can update marketplace orders" ON public.marketplace_orders;

-- Require authentication for all operations
CREATE POLICY "Authenticated users can view orders"
ON public.marketplace_orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create orders"
ON public.marketplace_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update orders"
ON public.marketplace_orders FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete orders"
ON public.marketplace_orders FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. PROFILES TABLE - Contains user information
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Require authentication to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 5. PRODUCTS TABLE - Add authentication requirement
CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage products"
ON public.products FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 6. EXPENSES TABLE - Add authentication requirement
CREATE POLICY "Authenticated users can view expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage expenses"
ON public.expenses FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 7. CASH_MOVEMENTS TABLE - Already has user_id based policies, ensure they're authentication-based
-- These look good already with user_id checks