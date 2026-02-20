import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Company() {
  const { user, companyId } = useAuth();
  const [form, setForm] = useState({ name: "", address: "", email: "", phone: "", rccm: "", numero_cc: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    supabase.from("companies_fact_digit2").select("*").eq("id", companyId).single()
      .then(({ data }) => {
        if (data) setForm({ name: data.name, address: data.address ?? "", email: data.email ?? "", phone: data.phone ?? "", rccm: data.rccm ?? "", numero_cc: data.numero_cc ?? "", website: data.website ?? "" });
        setLoading(false);
      });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (companyId) {
      const { error } = await supabase.from("companies_fact_digit2").update(form).eq("id", companyId);
      if (error) toast.error(error.message);
      else toast.success("Entreprise mise à jour");
    } else {
      const { data, error } = await supabase.from("companies_fact_digit2").insert(form).select().single();
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
