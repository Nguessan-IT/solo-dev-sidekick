import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, ShieldCheck, BarChart3, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: FileText, title: "Facturation intelligente", desc: "Créez et envoyez vos factures normalisées en quelques clics. Conformité DGI garantie.", color: "from-blue-500 to-cyan-500" },
  { icon: Users, title: "Gestion clients", desc: "Base clients complète avec historique de transactions et suivi en temps réel.", color: "from-violet-500 to-purple-500" },
  { icon: ShieldCheck, title: "Conformité FNE", desc: "Factures normalisées électroniques validées par la Direction Générale des Impôts.", color: "from-emerald-500 to-green-500" },
  { icon: BarChart3, title: "Rapports & Analytics", desc: "Tableau de bord interactif avec bilans financiers automatiques.", color: "from-amber-500 to-orange-500" },
];

const stats = [
  { label: "Entreprises", value: "500+", icon: Globe },
  { label: "Factures générées", value: "25K+", icon: FileText },
  { label: "Sécurité", value: "100%", icon: Lock },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-accent-foreground/5 blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Fact-Digit</h1>
        </div>
        <Button variant="outline" size="sm" className="rounded-full px-5 font-medium border-border/60 hover:bg-accent" onClick={() => navigate("/auth")}>
          Se connecter
        </Button>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-16 md:pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20"
        >
          <Zap className="h-3.5 w-3.5" />
          La facturation nouvelle génération en Côte d'Ivoire
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
        >
          Gérez vos factures.
          <br />
          <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">
            Simplifiez votre business.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed"
        >
          Fact-Digit est la solution tout-en-un pour les PME ivoiriennes : facturation normalisée FNE,
          gestion clients, catalogue produits et rapports financiers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <Button
            size="lg"
            className="rounded-full px-8 font-semibold text-base h-12 shadow-[var(--shadow-elegant)]"
            onClick={() => navigate("/auth")}
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 font-medium text-base h-12 border-border/60 hover:bg-accent"
          >
            Voir la démo
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center gap-8 md:gap-16 mt-16 pt-8 border-t border-border/50"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <s.icon className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Tout ce dont vous avez besoin
          </h3>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
            Une plateforme complète pour gérer votre entreprise en toute sérénité.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col p-6 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow duration-500 h-full"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-2">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <h3 className="relative text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à digitaliser votre facturation ?
          </h3>
          <p className="relative text-primary-foreground/80 text-sm md:text-base mb-8 max-w-lg mx-auto">
            Rejoignez des centaines d'entreprises ivoiriennes qui font confiance à Fact-Digit.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="relative rounded-full px-8 font-semibold text-base h-12"
            onClick={() => navigate("/auth")}
          >
            Créer mon compte
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Fact-Digit — Solution de facturation pour la Côte d'Ivoire
        </p>
      </footer>
    </div>
  );
}
