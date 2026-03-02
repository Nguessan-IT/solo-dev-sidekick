import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  { icon: FileText, title: "Facturation simple", desc: "Créez vos factures en quelques clics avec nos modèles professionnels" },
  { icon: Users, title: "Gestion clients", desc: "Gérez votre base clients et suivez l'historique de vos transactions" },
  { icon: ShieldCheck, title: "Catalogue produits", desc: "Organisez vos produits et services avec gestion des prix et TVA" },
  { icon: BarChart3, title: "Tableau de bord", desc: "Suivez vos performances avec des rapports détaillés" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, hsl(220 14% 96%) 0%, hsl(225 15% 88%) 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Fact-Digit</h1>
        <Button variant="default" size="sm" className="rounded-md px-5 font-medium" onClick={() => navigate("/auth")}>
          Se connecter
        </Button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center pt-16 pb-20 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight max-w-2xl" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          Solution de facturation{" "}
          <br className="hidden md:block" />
          pour la Côte d'Ivoire
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl text-sm leading-relaxed">
          Simplifiez votre gestion des factures avec Fact-Digit. Conformité DGI, factures
          normalisées et gestion d'entreprise tout-en-un.
        </p>
        <div className="flex gap-4 mt-8">
          <Button size="lg" className="rounded-md px-6 font-medium" onClick={() => navigate("/auth")}>
            Commencer gratuitement
          </Button>
          <Button size="lg" variant="outline" className="rounded-md px-6 font-medium bg-background/60 border-border hover:bg-background">
            En savoir plus
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-6 pb-24">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm">
            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <f.icon className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
