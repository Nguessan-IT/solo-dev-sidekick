import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, User, Mail, Phone, Lock, MapPin, FileText } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);

  // Signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [rccm, setRccm] = useState("");
  const [numeroCC, setNumeroCC] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Entrez votre email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Un email de réinitialisation a été envoyé !");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Vérifier que l'utilisateur appartient à Fact-Digit
    const { data: profile } = await supabase
      .from("profiles_fact_digit2")
      .select("id")
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      toast.error("Aucun compte Fact-Digit associé à cet email.");
      setLoading(false);
      return;
    }
    navigate("/dashboard");
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) { toast.error("Le nom de l'entreprise est requis"); return; }
    if (!firstName.trim() || !lastName.trim()) { toast.error("Nom et prénom sont requis"); return; }
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role_fact_digit2: "user", first_name: firstName, last_name: lastName },
      },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }

    if (authData.user) {
      const { data: company, error: companyError } = await supabase
        .from("companies_fact_digit2")
        .insert({
          name: companyName,
          address: companyAddress || null,
          phone: companyPhone || null,
          rccm: rccm || null,
          numero_cc: numeroCC || null,
          email: email,
        })
        .select()
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
      } else if (company) {
        await supabase
          .from("profiles_fact_digit2")
          .update({ company_id: company.id, phone: phone || null, first_name: firstName, last_name: lastName })
          .eq("user_id", authData.user.id);
      }
    }

    toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)" }}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Fact-Digit</CardTitle>
          <CardDescription>Solution de facturation pour les entreprises ivoiriennes</CardDescription>
        </CardHeader>
        <CardContent>
          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <div><Label htmlFor="email-forgot">Email</Label><Input id="email-forgot" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</Button>
              <button type="button" className="text-sm text-primary hover:underline w-full text-center" onClick={() => setForgotMode(false)}>Retour à la connexion</button>
            </form>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div><Label htmlFor="email-login">Email</Label><Input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><Label htmlFor="password-login">Mot de passe</Label><Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</Button>
                  <button type="button" className="text-sm text-muted-foreground hover:text-primary hover:underline w-full text-center" onClick={() => setForgotMode(true)}>Mot de passe oublié ?</button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  {/* Section Responsable */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>Responsable</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Koné" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone-signup">Téléphone</Label>
                      <Input id="phone-signup" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00" />
                    </div>
                  </div>

                  {/* Section Entreprise */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Entreprise</span>
                    </div>
                    <div>
                      <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                      <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ma Société SARL" required />
                    </div>
                    <div>
                      <Label htmlFor="companyAddress">Adresse</Label>
                      <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Abidjan, Cocody" />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Téléphone entreprise</Label>
                      <Input id="companyPhone" type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+225 27 00 00 00" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="rccm">RCCM</Label>
                        <Input id="rccm" value={rccm} onChange={(e) => setRccm(e.target.value)} placeholder="CI-ABJ-XX-XXXX" />
                      </div>
                      <div>
                        <Label htmlFor="numeroCC">N° Compte Contribuable</Label>
                        <Input id="numeroCC" value={numeroCC} onChange={(e) => setNumeroCC(e.target.value)} placeholder="XXXXXXXXX" />
                      </div>
                    </div>
                  </div>

                  {/* Section Compte */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>Identifiants</span>
                    </div>
                    <div>
                      <Label htmlFor="email-signup">Email *</Label>
                      <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@entreprise.ci" required />
                    </div>
                    <div>
                      <Label htmlFor="password-signup">Mot de passe *</Label>
                      <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 caractères" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Création en cours..." : "Créer mon compte entreprise"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
