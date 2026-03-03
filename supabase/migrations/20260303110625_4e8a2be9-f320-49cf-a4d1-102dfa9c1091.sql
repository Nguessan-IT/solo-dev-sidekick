
-- Create a security definer function to check super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles_fact_digit2
    WHERE user_id = _user_id
      AND role = 'super_admin'::app_role
  )
$$;

-- Insert super_admin role for fiacrenguessan@outlook.com
INSERT INTO public.user_roles_fact_digit2 (user_id, role)
VALUES ('73284fff-2b99-405e-8489-2b306b953055', 'super_admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
