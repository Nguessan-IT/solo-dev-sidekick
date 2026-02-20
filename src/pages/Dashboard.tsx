import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, TrendingUp } from "lucide-react";

interface DashboardStats {
  clients_count: number;
  products_count: number;
  invoices_count: number;
  total_revenue: number;
  total_tva: number;
}

export default function Dashboard() {
  const { companyId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    supabase.rpc("get_dashboard_stats", { p_company_id: companyId })
      .then(({ data }) => {
        if (data && data.length > 0) setStats(data[0]);
        setLoading(false);
      });
  }, [companyId]);

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Bienvenue sur Fact-Digit</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Veuillez d'abord configurer votre entreprise dans la section "Entreprise".</p></CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    { title: "Clients", value: stats?.clients_count ?? 0, icon: Users, color: "text-primary" },
    { title: "Produits", value: stats?.products_count ?? 0, icon: Package, color: "text-primary" },
    { title: "Factures", value: stats?.invoices_count ?? 0, icon: FileText, color: "text-primary" },
    { title: "Chiffre d'affaires", value: `${(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} FCFA`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
