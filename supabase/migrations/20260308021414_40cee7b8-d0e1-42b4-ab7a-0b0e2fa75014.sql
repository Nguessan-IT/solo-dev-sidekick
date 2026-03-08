
-- Allow super_admin to SELECT all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles_fact_digit2
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow super_admin to SELECT all companies
CREATE POLICY "Super admins can view all companies"
ON public.companies_fact_digit2
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow super_admin to SELECT all invoices
CREATE POLICY "Super admins can view all invoices"
ON public.invoices_fact_digit2
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow super_admin to SELECT all clients
CREATE POLICY "Super admins can view all clients"
ON public.clients_fact_digit2
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow super_admin to SELECT all products
CREATE POLICY "Super admins can view all products"
ON public.products_fact_digit2
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));
