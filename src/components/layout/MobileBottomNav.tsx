import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Package, FileText, Building2 } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/invoices/new", icon: FileText, label: "Facture" },
  { to: "/products", icon: Package, label: "Produits" },
  { to: "/company", icon: Building2, label: "Entreprise" },
];

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around py-2 px-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors ${
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
