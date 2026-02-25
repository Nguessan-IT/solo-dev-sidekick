import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, Package, BarChart3 } from "lucide-react";

const features = [
  { icon: FileText, title: "Facturation simple", desc: "Créez vos factures en quelques clics avec nos modèles professionnels" },
  { icon: Users, title: "Gestion clients", desc: "Gérez votre base clients et suivez l'historique de vos transactions" },
  { icon: Package, title: "Catalogue produits", desc: "Organisez vos produits et services avec gestion des prix et TVA" },
  { icon: BarChart3, title: "Tableau de bord", desc: "Suivez vos performances avec des rapports détaillés" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-background border-b">
        <h1 className="text-xl font-bold text-foreground">Fact-Digit</h1>
        <Button variant="default" onClick={() => navigate("/auth")}>Se connecter</Button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
          Solution de facturation<br />pour la Côte d'Ivoire
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl">
          Simplifiez votre gestion des factures avec Fact-Digit. Conformité DGI, factures normalisées et gestion d'entreprise tout-en-un.
        </p>
        <div className="flex gap-4 mt-8">
          <Button size="lg" onClick={() => navigate("/auth")}>Commencer gratuitement</Button>
          <Button size="lg" variant="outline">En savoir plus</Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-6 pb-20">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-xl bg-background">
            <f.icon className="h-10 w-10 text-foreground mb-4" />
            <h3 className="font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
