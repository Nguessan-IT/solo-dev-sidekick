import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, FileText, TrendingUp, Plus } from "lucide-react";

interface DashboardStats {
  clients_count: number;
  products_count: number;
  invoices_count: number;
  total_revenue: number;
  total_tva: number;
}

export default function Dashboard() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const { data: statsData } = await supabase.rpc("get_dashboard_stats", { p_company_id: companyId });
        if (statsData && Array.isArray(statsData) && statsData.length > 0) {
          setStats(statsData[0]);
        }

        const { data: invoicesData } = await supabase
          .from("invoices_fact_digit2")
          .select("id, invoice_number, total_amount, status, date_issued, clients_fact_digit2(name)")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(5);
        
        setRecentInvoices(invoicesData ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Bienvenue sur Fact-Digit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Veuillez d'abord configurer votre entreprise.</p>
            <Button onClick={() => navigate("/company")}>Configurer l'entreprise</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    { title: "Clients", value: stats?.clients_count ?? 0, icon: Users, link: "/clients" },
    { title: "Produits", value: stats?.products_count ?? 0, icon: Package, link: "/products" },
    { title: "Factures", value: stats?.invoices_count ?? 0, icon: FileText, link: "/invoices" },
    { title: "Chiffre d'affaires", value: `${(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} FCFA`, icon: TrendingUp, link: "/invoices" },
  ];

  const statusLabel = (s: string | null) => {
    const map: Record<string, string> = { draft: "Brouillon", pending: "En attente", paid: "Payée" };
    return map[s ?? "draft"] ?? s ?? "Brouillon";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button onClick={() => navigate("/invoices/new")}><Plus className="h-4 w-4 mr-2" />Nouvelle facture</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(card.link)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <card.icon className="h-8 w-8 text-primary opacity-80" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dernières factures</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate("/invoices")}>Voir tout</Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucune facture. Créez votre première facture !</p>
              ) : (
                <div className="space-y-3">
                  {recentInvoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{inv.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{inv.clients_fact_digit2?.name ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(inv.total_amount ?? 0).toLocaleString("fr-FR")} FCFA</p>
                        <p className="text-xs text-muted-foreground">{statusLabel(inv.status)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader><CardTitle>Résumé fiscal</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">TVA collectée</p>
                    <p className="text-xl font-bold">{(stats.total_tva ?? 0).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Revenu net (HT)</p>
                    <p className="text-xl font-bold">{((stats.total_revenue ?? 0) - (stats.total_tva ?? 0)).toLocaleString("fr-FR")} FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
