import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export default function Company() {
  const { user, companyId } = useAuth();
  const [form, setForm] = useState({ name: "", address: "", email: "", phone: "", rccm: "", numero_cc: "", website: "" });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    supabase.from("companies_fact_digit2").select("*").eq("id", companyId).single()
      .then(({ data }) => {
        if (data) {
          setForm({ name: data.name, address: data.address ?? "", email: data.email ?? "", phone: data.phone ?? "", rccm: data.rccm ?? "", numero_cc: data.numero_cc ?? "", website: data.website ?? "" });
          setLogoUrl(data.logo_url ?? null);
        }
        setLoading(false);
      });
  }, [companyId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${companyId || "new"}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erreur lors de l'upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(filePath);

    setLogoUrl(urlData.publicUrl);

    if (companyId) {
      await supabase.from("companies_fact_digit2").update({ logo_url: urlData.publicUrl }).eq("id", companyId);
      toast.success("Logo mis à jour");
    }

    setUploading(false);
  };

  const handleRemoveLogo = async () => {
    setLogoUrl(null);
    if (companyId) {
      await supabase.from("companies_fact_digit2").update({ logo_url: null }).eq("id", companyId);
      toast.success("Logo supprimé");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, logo_url: logoUrl };
    if (companyId) {
      const { error } = await supabase.from("companies_fact_digit2").update(payload).eq("id", companyId);
      if (error) toast.error(error.message);
      else toast.success("Entreprise mise à jour");
    } else {
      const { data, error } = await supabase.from("companies_fact_digit2").insert(payload).select().single();
      if (error) toast.error(error.message);
      else if (data && user) {
        await supabase.from("profiles_fact_digit2").update({ company_id: data.id }).eq("user_id", user.id);
        toast.success("Entreprise créée ! Rechargez la page.");
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Mon entreprise</h1>
      <Card>
        <CardHeader><CardTitle>{companyId ? "Modifier" : "Créer"} votre entreprise</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo upload */}
            <div>
              <Label>Logo de l'entreprise</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative">
                    <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-lg object-contain border border-border bg-muted" />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/50"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Logo</span>
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Upload..." : logoUrl ? "Changer le logo" : "Ajouter un logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG. Max 2 Mo.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div><Label>Nom de l'entreprise *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>RCCM</Label><Input value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })} /></div>
              <div><Label>N° Compte Contribuable</Label><Input value={form.numero_cc} onChange={(e) => setForm({ ...form, numero_cc: e.target.value })} /></div>
            </div>
            <div><Label>Site web</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : companyId ? "Mettre à jour" : "Créer l'entreprise"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
