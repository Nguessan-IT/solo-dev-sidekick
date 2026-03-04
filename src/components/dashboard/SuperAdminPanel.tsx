import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown, Users, Building2, Shield, Globe, Activity, Database, Eye,
  TrendingUp, PieChart as PieChartIcon, BarChart3, CalendarDays, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceRow {
  total_amount: number | null;
  created_at: string;
  status: string | null;
}

interface CompanyRow {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
}

interface UserRow {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_id: string | null;
  created_at: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CHART_COLORS = [
  "hsl(215, 80%, 56%)",
  "hsl(152, 60%, 45%)",
  "hsl(38, 88%, 52%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 55%)",
];

type TabKey = "analytics" | "companies" | "users";

export default function SuperAdminPanel() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profilesRes, companiesRes, invoicesRes] = await Promise.all([
        supabase.from("profiles_fact_digit2").select("id, user_id, email, first_name, last_name, company_id, created_at"),
        supabase.from("companies_fact_digit2").select("id, name, email, created_at").order("created_at", { ascending: false }),
        supabase.from("invoices_fact_digit2").select("total_amount, created_at, status"),
      ]);
      setUsers(profilesRes.data ?? []);
      setCompanies(companiesRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);
    } catch (err) {
      console.error("SuperAdmin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = useMemo(() => invoices.reduce((s, i) => s + (i.total_amount ?? 0), 0), [invoices]);

  // Monthly revenue chart data
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    invoices.forEach((inv) => {
      const d = new Date(inv.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] ?? 0) + (inv.total_amount ?? 0);
    });
    const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
    return sorted.map(([k, v]) => {
      const [y, m] = k.split("-");
      const label = new Date(+y, +m - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      return { name: label, revenue: v };
    });
  }, [invoices]);

  // Invoice status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    invoices.forEach((inv) => {
      const s = inv.status ?? "draft";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  // User growth over time
  const userGrowthData = useMemo(() => {
    const months: Record<string, number> = {};
    users.forEach((u) => {
      const d = new Date(u.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] ?? 0) + 1;
    });
    const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
    let cumulative = 0;
    return sorted.map(([k, v]) => {
      cumulative += v;
      const [y, m] = k.split("-");
      const label = new Date(+y, +m - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      return { name: label, users: cumulative, new: v };
    });
  }, [users]);

  // Radial gauge data
  const gaugeData = useMemo(() => [
    { name: "Utilisateurs", value: users.length, fill: CHART_COLORS[0] },
    { name: "Entreprises", value: companies.length, fill: CHART_COLORS[1] },
    { name: "Factures", value: invoices.length, fill: CHART_COLORS[2] },
  ], [users, companies, invoices]);

  const kpis = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "hsl(215, 80%, 56%)" },
    { label: "Entreprises", value: companies.length, icon: Building2, color: "hsl(152, 60%, 45%)" },
    { label: "Factures", value: invoices.length, icon: Database, color: "hsl(38, 88%, 52%)" },
    { label: "Revenu Global", value: `${totalRevenue.toLocaleString("fr-FR")} CFA`, icon: Globe, color: "hsl(280, 60%, 55%)" },
  ];

  const tabs: { key: TabKey; label: string; icon: typeof Eye }[] = [
    { key: "analytics", label: "Analytique", icon: BarChart3 },
    { key: "companies", label: "Entreprises", icon: Building2 },
    { key: "users", label: "Utilisateurs", icon: Users },
  ];

  const tooltipStyle = {
    background: "hsl(215, 25%, 10%)",
    border: "1px solid hsl(215, 22%, 20%)",
    borderRadius: "8px",
    color: "hsl(210, 20%, 94%)",
    fontSize: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 mt-10">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Console Super Admin</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Contrôle de la plateforme
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </motion.div>

      {/* KPI Strip */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <Card key={kpi.label} className="border-border/60 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: kpi.color + "18" }}>
                <kpi.icon className="h-4.5 w-4.5" style={{ color: kpi.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-xl font-bold tracking-tight leading-tight">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Analytics Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Revenue + Status Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2 border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Revenus mensuels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="saRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(215, 80%, 56%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(215, 80%, 56%)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 22%, 18%)" opacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 14%, 52%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 52%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr-FR")} CFA`, "Revenu"]} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(215, 80%, 56%)" strokeWidth={2.5} fill="url(#saRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-warning" />
                    Statut factures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* User Growth + Radial */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2 border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-success" />
                    Croissance utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="saUserGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 22%, 18%)" opacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 14%, 52%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 52%)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="new" name="Nouveaux" fill="url(#saUserGrad)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="users" name="Cumulatif" fill="hsl(215, 80%, 56%)" opacity={0.25} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Vue radiale
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={gaugeData} startAngle={180} endAngle={0}>
                      <RadialBar dataKey="value" cornerRadius={6} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {gaugeData.map((g) => (
                      <div key={g.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: g.fill }} />
                        {g.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Companies Tab */}
        {activeTab === "companies" && (
          <motion.div
            key="companies"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-success" />
                  Entreprises enregistrées ({companies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/50">
                  {companies.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Aucune entreprise</p>
                  ) : (
                    companies.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email ?? "—"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {new Date(c.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Utilisateurs ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/50">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Aucun utilisateur</p>
                  ) : (
                    users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">
                            {[u.first_name, u.last_name].filter(Boolean).join(" ") || "Sans nom"}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${u.company_id ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                            {u.company_id ? "Actif" : "Sans entreprise"}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                            {new Date(u.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
