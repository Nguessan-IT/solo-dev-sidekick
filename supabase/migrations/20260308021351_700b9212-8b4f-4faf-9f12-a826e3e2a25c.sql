
-- Step 1: Move all old company data to new company
UPDATE public.clients_fact_digit2 
SET company_id = '39e4942c-2eb7-4ded-9fe0-904393971fb3' 
WHERE company_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.products_fact_digit2 
SET company_id = '39e4942c-2eb7-4ded-9fe0-904393971fb3' 
WHERE company_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.invoices_fact_digit2 
SET company_id = '39e4942c-2eb7-4ded-9fe0-904393971fb3' 
WHERE company_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.financial_reports_fact_digit2 
SET company_id = '39e4942c-2eb7-4ded-9fe0-904393971fb3' 
WHERE company_id = '00000000-0000-0000-0000-000000000001';

-- Step 2: Update the new company with old company info
UPDATE public.companies_fact_digit2
SET email = 'fiacrenguessan@outlook.com'
WHERE id = '39e4942c-2eb7-4ded-9fe0-904393971fb3' AND email IS NULL;

-- Step 3: Delete old orphan company
DELETE FROM public.companies_fact_digit2 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Step 4: Update profile with name
UPDATE public.profiles_fact_digit2
SET first_name = 'Fiacre', last_name = 'Nguessan'
WHERE user_id = '87c8afe6-7ae0-4fa4-9c46-1837dade93c8';

-- Step 5: Add super_admin role
INSERT INTO public.user_roles_fact_digit2 (user_id, role)
VALUES ('87c8afe6-7ae0-4fa4-9c46-1837dade93c8', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
