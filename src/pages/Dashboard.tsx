import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, FileText, TrendingUp, Building2, LogOut, ClipboardList, ArrowUpRight, Zap, BarChart3, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import SuperAdminPanel from "@/components/dashboard/SuperAdminPanel";

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

const GlowOrb = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

export default function Dashboard() {
  const { companyId, signOut } = useAuth();
  const navigate = useNavigate();
  const { isSuperAdmin } = useSuperAdmin();
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
        if (statsRes.data && Array.isArray(statsRes.data) && statsRes.data.length > 0) setStats(statsRes.data[0]);
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
        <Card className="max-w-md"><CardHeader><CardTitle>Bienvenue sur Fact-Digit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Veuillez d'abord configurer votre entreprise.</p>
            <Button onClick={() => navigate("/company")}>Configurer l'entreprise</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { title: "Clients", value: stats?.clients_count ?? 0, sub: "Clients actifs", icon: Users, gradient: "from-blue-500 to-cyan-400", glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]" },
    { title: "Produits", value: stats?.products_count ?? 0, sub: "En catalogue", icon: Package, gradient: "from-violet-500 to-purple-400", glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]" },
    { title: "Factures", value: stats?.invoices_count ?? 0, sub: "Émises", icon: FileText, gradient: "from-emerald-500 to-green-400", glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]" },
    { title: "Chiffre d'affaires", value: `${(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} CFA`, sub: "Revenus totaux", icon: TrendingUp, gradient: "from-amber-500 to-orange-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]" },
  ];

  const quickActions = [
    { title: "Clients", desc: "Gérer vos clients", icon: Users, btn: "+ Client", link: "/clients", gradient: "from-blue-500/10 to-cyan-400/10", border: "border-blue-500/30" },
    { title: "Produits", desc: "Catalogue produits", icon: Package, btn: "+ Produit", link: "/products", gradient: "from-violet-500/10 to-purple-400/10", border: "border-violet-500/30" },
    { title: "Factures", desc: "Créer des factures", icon: FileText, btn: "+ Facture", link: "/invoices/new", gradient: "from-emerald-500/10 to-green-400/10", border: "border-emerald-500/30" },
    { title: "Entreprise", desc: "Paramètres", icon: Building2, btn: "Modifier", link: "/company", gradient: "from-amber-500/10 to-orange-400/10", border: "border-amber-500/30" },
  ];

  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
  const areaData = months.map((m, i) => ({ name: m, revenue: Math.round((stats?.total_revenue ?? 300000) * (0.6 + i * 0.08)) }));
  const barData = [
    { name: "Clients", value: stats?.clients_count ?? 0 },
    { name: "Produits", value: stats?.products_count ?? 0 },
    { name: "Factures", value: stats?.invoices_count ?? 0 },
  ];

  return (
    <div className="relative space-y-6 overflow-hidden">
      {/* Background glowing orbs */}
      <GlowOrb className="w-96 h-96 bg-blue-500 -top-48 -left-48" />
      <GlowOrb className="w-80 h-80 bg-violet-500 top-1/3 -right-40" />
      <GlowOrb className="w-64 h-64 bg-emerald-500 bottom-0 left-1/3" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          {company?.logo_url && (
            <motion.img
              src={company.logo_url}
              alt="Logo"
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
          )}
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {company?.name ?? "Mon Entreprise"}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" /> Tableau de bord
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/reports")}
            className="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-foreground"
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Bilan</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10"
      >
        <h2 className="text-3xl font-extrabold">
          Bonjour{" "}
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {company?.name ?? "Utilisateur"}
          </span>{" "}
          <motion.span
            animate={{ rotate: [0, 20, -10, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            👋
          </motion.span>
        </h2>
        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
          <Zap className="h-4 w-4 text-amber-400" /> Aperçu de votre activité en temps réel
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded-lg" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, idx) => (
              <motion.div key={card.title} variants={item}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className={`relative overflow-hidden border-border/30 bg-card/60 backdrop-blur-xl ${card.glow} hover:shadow-lg transition-shadow duration-500`}>
                    {/* Gradient bar top */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
                    {/* Glow corner */}
                    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`} />
                    <CardContent className="p-5 relative">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                          <card.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <motion.p
                        className="text-3xl font-black mt-3 tracking-tight"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {card.value}
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div variants={item}>
              <Card className="border-border/30 bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    Évolution CA
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">6 derniers mois</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/30 bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    Aperçu données
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Vue d'ensemble</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                        }}
                      />
                      <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" /> Actions rapides
              </h3>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, idx) => (
                <motion.div key={action.title} variants={item}>
                  <motion.div whileHover={{ scale: 1.04, y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className={`border ${action.border} bg-gradient-to-br ${action.gradient} backdrop-blur-xl hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                      <CardContent className="p-5 space-y-3">
                        <motion.div
                          className="h-11 w-11 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform"
                        >
                          <action.icon className="h-5 w-5 text-foreground" />
                        </motion.div>
                        <div>
                          <p className="font-semibold">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-border/50 bg-card/50 backdrop-blur hover:bg-card/80"
                          onClick={() => navigate(action.link)}
                        >
                          {action.btn}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Financial Reports */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-400" /> Bilans Archivés
              </h3>
            </div>
            <Card className="border-border/30 bg-card/60 backdrop-blur-xl">
              <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                {reports.length === 0 ? (
                  <>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FileText className="h-14 w-14 text-muted-foreground/30 mb-3" />
                    </motion.div>
                    <p className="font-medium text-muted-foreground">Aucun bilan archivé</p>
                    <p className="text-sm text-muted-foreground/60">Les bilans financiers apparaîtront ici</p>
                  </>
                ) : (
                  <div className="w-full space-y-2">
                    {reports.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 backdrop-blur border border-border/20 hover:border-blue-500/30 transition-colors"
                      >
                        <span className="font-medium">{r.period}</span>
                        <span className="font-mono text-sm">{r.revenue.toLocaleString("fr-FR")} FCFA</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Super Admin Panel */}
      {isSuperAdmin && <SuperAdminPanel />}
    </div>
  );
}
