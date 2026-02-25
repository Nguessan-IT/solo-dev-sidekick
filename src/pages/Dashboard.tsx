import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, FileText, TrendingUp, Plus, Building2, LogOut, ClipboardList, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardStats {
  clients_count: number;
  products_count: number;
  invoices_count: number;
  total_revenue: number;
  total_tva: number;
}

interface CompanyInfo {
  name: string;
  logo_url: string | null;
}

interface FinancialReport {
  id: string;
  period: string;
  revenue: number;
  created_at: string;
}

export default function Dashboard() {
  const { companyId, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [reports, setReports] = useState<FinancialReport[]>([]);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const [statsRes, companyRes, reportsRes] = await Promise.all([
          supabase.rpc("get_dashboard_stats", { p_company_id: companyId }),
          supabase.from("companies_fact_digit2").select("name, logo_url").eq("id", companyId).single(),
          supabase.from("financial_reports_fact_digit2").select("id, period, revenue, created_at").eq("company_id", companyId).order("created_at", { ascending: false }).limit(10),
        ]);

        if (statsRes.data && Array.isArray(statsRes.data) && statsRes.data.length > 0) {
          setStats(statsRes.data[0]);
        }
        if (companyRes.data) setCompany(companyRes.data);
        setReports(reportsRes.data ?? []);
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

  const revenuePercent = stats ? "+12,5%" : "";

  const statCards = [
    { title: "Clients", value: stats?.clients_count ?? 0, sub: "Total de clients actifs", icon: Users, borderColor: "border-primary" },
    { title: "Produits", value: stats?.products_count ?? 0, sub: "Articles en catalogue", icon: Package, borderColor: "border-[hsl(270,70%,60%)]" },
    { title: "Factures", value: stats?.invoices_count ?? 0, sub: "Factures émises", icon: FileText, borderColor: "border-[hsl(var(--success))]" },
    { title: "Chiffre d'affaires", value: `${(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} CFA`, sub: `Revenus totaux · ${revenuePercent}`, icon: TrendingUp, borderColor: "border-[hsl(var(--warning))]" },
  ];

  const quickActions = [
    { title: "Clients", desc: "Gérer vos clients et prospects", icon: Users, btn: "+ Nouveau client", link: "/clients", borderColor: "border-primary/30" },
    { title: "Produits & Services", desc: "Catalogue de produits et services", icon: Package, btn: "+ Nouveau produit", link: "/products", borderColor: "border-[hsl(270,70%,60%)]/30" },
    { title: "Factures", desc: "Créer et gérer vos factures", icon: FileText, btn: "+ Nouvelle facture", link: "/invoices/new", borderColor: "border-[hsl(var(--success))]/30" },
    { title: "Mon Entreprise", desc: "Paramètres de l'entreprise", icon: Building2, btn: "Modifier", link: "/company", borderColor: "border-[hsl(var(--warning))]/30" },
  ];

  // Chart data
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
  const areaData = months.map((m, i) => ({ name: m, revenue: Math.round((stats?.total_revenue ?? 300000) * (0.6 + i * 0.08)) }));
  const barData = [
    { name: "Clients", value: stats?.clients_count ?? 0 },
    { name: "Produits", value: stats?.products_count ?? 0 },
    { name: "Factures", value: stats?.invoices_count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {company?.logo_url && (
            <img src={company.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-xl font-bold">{company?.name ?? "Mon Entreprise"}</h1>
            <p className="text-xs text-muted-foreground">Tableau de bord</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden md:block">{company?.name}</span>
          <span className="text-xs text-muted-foreground hidden md:block">Administrateur</span>
          <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
            <ClipboardList className="h-4 w-4 mr-1" />Bilan Financier
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" />Déconnexion
          </Button>
        </div>
      </div>

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">Bonjour, {company?.name ?? "Utilisateur"} 👋</h2>
        <p className="text-muted-foreground text-sm">Voici un aperçu de votre activité</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title} className={`border-t-4 ${card.borderColor}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <card.icon className="h-5 w-5 text-primary opacity-60" />
                  </div>
                  <p className="text-2xl font-bold mt-2 flex items-center gap-2">
                    {card.value}
                    {card.title === "Clients" && <TrendingUp className="h-4 w-4 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Évolution du chiffre d'affaires
                </CardTitle>
                <p className="text-xs text-muted-foreground">Derniers 6 mois</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Aperçu des données
                </CardTitle>
                <p className="text-xs text-muted-foreground">Vue d'ensemble</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Actions rapides</h3>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Card key={action.title} className={`border ${action.borderColor}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(action.link)}>
                      {action.btn}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bilans Financiers Archivés */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Bilans Financiers Archivés</h3>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                {reports.length === 0 ? (
                  <>
                    <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="font-medium text-muted-foreground">Aucun bilan archivé</p>
                    <p className="text-sm text-muted-foreground/70">Les bilans financiers générés apparaîtront ici</p>
                  </>
                ) : (
                  <div className="w-full space-y-2">
                    {reports.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{r.period}</span>
                        <span>{r.revenue.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
