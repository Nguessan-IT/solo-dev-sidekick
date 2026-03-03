import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("user_roles_fact_digit2")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      setIsSuperAdmin(!!data);
      setLoading(false);
    };
    check();
  }, [user]);

  return { isSuperAdmin, loading };
}
