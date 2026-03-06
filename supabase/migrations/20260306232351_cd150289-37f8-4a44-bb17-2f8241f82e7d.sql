
-- Drop ALL existing policies on companies_fact_digit2
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies_fact_digit2;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies_fact_digit2;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies_fact_digit2;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Authenticated users can create companies"
  ON public.companies_fact_digit2
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their company"
  ON public.companies_fact_digit2
  FOR SELECT
  TO authenticated
  USING (id = public.user_company_id(auth.uid()));

CREATE POLICY "Users can update their company"
  ON public.companies_fact_digit2
  FOR UPDATE
  TO authenticated
  USING (id = public.user_company_id(auth.uid()));

-- Ensure RLS is enabled
ALTER TABLE public.companies_fact_digit2 ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too
ALTER TABLE public.companies_fact_digit2 FORCE ROW LEVEL SECURITY;
