
CREATE OR REPLACE FUNCTION public.create_company_for_signup(
  _user_id uuid,
  _company_name text,
  _company_address text DEFAULT NULL,
  _company_phone text DEFAULT NULL,
  _company_email text DEFAULT NULL,
  _company_rccm text DEFAULT NULL,
  _company_numero_cc text DEFAULT NULL,
  _user_phone text DEFAULT NULL,
  _user_first_name text DEFAULT NULL,
  _user_last_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  INSERT INTO public.companies_fact_digit2 (name, address, phone, email, rccm, numero_cc)
  VALUES (_company_name, _company_address, _company_phone, _company_email, _company_rccm, _company_numero_cc)
  RETURNING id INTO new_company_id;

  UPDATE public.profiles_fact_digit2
  SET company_id = new_company_id,
      phone = _user_phone,
      first_name = _user_first_name,
      last_name = _user_last_name
  WHERE user_id = _user_id;

  RETURN new_company_id;
END;
$$;
