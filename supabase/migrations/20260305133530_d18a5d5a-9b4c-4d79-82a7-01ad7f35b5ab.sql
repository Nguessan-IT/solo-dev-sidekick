
-- Drop the restrictive INSERT policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies_fact_digit2;
CREATE POLICY "Authenticated users can create companies"
  ON public.companies_fact_digit2
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop and recreate SELECT as PERMISSIVE
DROP POLICY IF EXISTS "Users can view their company" ON public.companies_fact_digit2;
CREATE POLICY "Users can view their company"
  ON public.companies_fact_digit2
  FOR SELECT
  TO authenticated
  USING (id = user_company_id(auth.uid()));

-- Drop and recreate UPDATE as PERMISSIVE
DROP POLICY IF EXISTS "Users can update their company" ON public.companies_fact_digit2;
CREATE POLICY "Users can update their company"
  ON public.companies_fact_digit2
  FOR UPDATE
  TO authenticated
  USING (id = user_company_id(auth.uid()));
