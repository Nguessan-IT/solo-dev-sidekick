import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { LayoutDashboard, Users, Package, FileText, Building2, LogOut, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/products", icon: Package, label: "Produits" },
  { to: "/invoices", icon: FileText, label: "Factures" },
  { to: "/company", icon: Building2, label: "Entreprise" },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
            <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">Fact-Digit</h1>
            <p className="text-[10px] text-sidebar-foreground/50 font-medium tracking-wider uppercase">Facturation & Gestion</p>
          </div>
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? "bg-sidebar-primary/15" : "bg-transparent group-hover:bg-sidebar-accent"
                }`}>
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
        {isSuperAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? "bg-sidebar-primary/15" : "bg-transparent group-hover:bg-sidebar-accent"
                }`}>
                  <Crown className="h-4 w-4" />
                </div>
                Admin
              </>
            )}
          </NavLink>
        )}
      </nav>
      <div className="p-3">
        <Separator className="bg-sidebar-border mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl h-10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
