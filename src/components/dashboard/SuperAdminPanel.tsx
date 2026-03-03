import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Users, Building2, Shield, Globe, Activity, Database, Eye, Trash2, ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PlatformStats {
  total_users: number;
  total_companies: number;
  total_invoices: number;
  total_revenue: number;
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
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } },
};

export default function SuperAdminPanel() {
  const [stats, setStats] = useState<PlatformStats>({ total_users: 0, total_companies: 0, total_invoices: 0, total_revenue: 0 });
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "users">("overview");
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
        supabase.from("invoices_fact_digit2").select("total_amount"),
      ]);

      const usersData = profilesRes.data ?? [];
      const companiesData = companiesRes.data ?? [];
      const invoicesData = invoicesRes.data ?? [];
      const totalRevenue = invoicesData.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);

      setUsers(usersData);
      setCompanies(companiesData);
      setStats({
        total_users: usersData.length,
        total_companies: companiesData.length,
        total_invoices: invoicesData.length,
        total_revenue: totalRevenue,
      });
    } catch (err) {
      console.error("SuperAdmin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const platformCards = [
    { title: "Utilisateurs", value: stats.total_users, icon: Users, gradient: "from-rose-500 to-pink-500", glow: "shadow-[0_0_40px_rgba(244,63,94,0.4)]" },
    { title: "Entreprises", value: stats.total_companies, icon: Building2, gradient: "from-amber-400 to-yellow-500", glow: "shadow-[0_0_40px_rgba(251,191,36,0.4)]" },
    { title: "Factures", value: stats.total_invoices, icon: Database, gradient: "from-cyan-400 to-blue-500", glow: "shadow-[0_0_40px_rgba(34,211,238,0.4)]" },
    { title: "Revenu Global", value: `${stats.total_revenue.toLocaleString("fr-FR")} CFA`, icon: Globe, gradient: "from-emerald-400 to-teal-500", glow: "shadow-[0_0_40px_rgba(52,211,153,0.4)]" },
  ];

  const tabs = [
    { key: "overview" as const, label: "Vue globale", icon: Eye },
    { key: "companies" as const, label: "Entreprises", icon: Building2 },
    { key: "users" as const, label: "Utilisateurs", icon: Users },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 mt-8">
      {/* Super Admin Header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-violet-500/10" />
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 opacity-10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 opacity-10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <motion.div
            className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Crown className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
              Super Admin Console
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              Contrôle total de la plateforme Fact-Digit
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform Stats */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platformCards.map((card, idx) => (
            <motion.div key={card.title} variants={item}>
              <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className={`relative overflow-hidden border-amber-500/20 bg-card/70 backdrop-blur-xl ${card.glow} transition-shadow duration-500`}>
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient}`} />
                  <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`} />
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
                      transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                    >
                      {card.value}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key
              ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white border-0 shadow-lg shadow-amber-500/30"
              : "border-amber-500/30 hover:bg-amber-500/10"
            }
          >
            <tab.icon className="h-4 w-4 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Content */}
      {activeTab === "companies" && (
        <motion.div variants={item}>
          <Card className="border-amber-500/20 bg-card/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                Toutes les entreprises ({companies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {companies.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">Aucune entreprise enregistrée</p>
              ) : (
                companies.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20 hover:border-amber-500/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "users" && (
        <motion.div variants={item}>
          <Card className="border-amber-500/20 bg-card/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-400" />
                Tous les utilisateurs ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">Aucun utilisateur</p>
              ) : (
                users.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20 hover:border-rose-500/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{u.first_name ?? ""} {u.last_name ?? ""}</p>
                      <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "overview" && (
        <motion.div variants={item}>
          <Card className="border-amber-500/20 bg-card/70 backdrop-blur-xl">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Activity className="h-16 w-16 text-amber-400/40 mb-4" />
              </motion.div>
              <p className="font-bold text-lg bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                Plateforme opérationnelle
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.total_companies} entreprises · {stats.total_users} utilisateurs · {stats.total_invoices} factures
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
