import { useEffect, useState } from "react";
import { initOfflineSync, enqueueAction, isOnline } from "@/lib/offlineSync";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_TABLES = [
  "clients_fact_digit2",
  "products_fact_digit2",
  "invoices_fact_digit2",
  "invoice_items_fact_digit2",
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

async function executeSyncAction(action: {
  table: string;
  method: string;
  payload: Record<string, any>;
}): Promise<boolean> {
  const { table, method, payload } = action;
  if (!ALLOWED_TABLES.includes(table as AllowedTable)) return false;

  let result: any;
  if (method === "insert") {
    result = await (supabase.from(table as AllowedTable) as any).insert(payload);
  } else if (method === "update") {
    const { id, ...rest } = payload;
    result = await (supabase.from(table as AllowedTable) as any).update(rest).eq("id", id);
  } else if (method === "delete") {
    result = await (supabase.from(table as AllowedTable) as any).delete().eq("id", payload.id);
  }
  return !result?.error;
}

export function useOfflineSync() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    initOfflineSync(executeSyncAction);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { online, enqueueAction };
}
