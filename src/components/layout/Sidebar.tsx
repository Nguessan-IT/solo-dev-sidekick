import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, Package, FileText, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/products", icon: Package, label: "Produits" },
  { to: "/invoices", icon: FileText, label: "Factures" },
  { to: "/company", icon: Building2, label: "Entreprise" },
];

export default function Sidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-primary">Fact-Digit</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Facturation & Gestion</p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
