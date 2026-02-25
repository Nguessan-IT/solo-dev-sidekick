import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  tva_rate: number | null;
  category: string | null;
  unit: string | null;
  is_service: boolean | null;
}

export default function Products() {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", tva_rate: "18", category: "", unit: "unité", is_service: false });

  const fetchProducts = async () => {
    if (!companyId) return;
    const { data } = await supabase.from("products_fact_digit2").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    const { error } = await supabase.from("products_fact_digit2").insert({
      name: form.name, price: parseFloat(form.price), tva_rate: parseFloat(form.tva_rate),
      category: form.category || null, unit: form.unit, is_service: form.is_service, company_id: companyId,
    });
    if (error) toast.error(error.message);
    else { toast.success("Produit ajouté"); setOpen(false); setForm({ name: "", price: "", tva_rate: "18", category: "", unit: "unité", is_service: false }); fetchProducts(); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produits & Services</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouveau produit</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix (FCFA)</TableHead>
                <TableHead>TVA %</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun produit</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.price.toLocaleString("fr-FR")}</TableCell>
                  <TableCell>{p.tva_rate ?? 0}%</TableCell>
                  <TableCell>{p.category ?? "—"}</TableCell>
                  <TableCell>{p.is_service ? "Service" : "Produit"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau produit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Nom *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prix (FCFA) *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div><Label>TVA %</Label><Input type="number" value={form.tva_rate} onChange={(e) => setForm({ ...form, tva_rate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Unité</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_service" checked={form.is_service} onChange={(e) => setForm({ ...form, is_service: e.target.checked })} />
              <Label htmlFor="is_service">C'est un service</Label>
            </div>
            <DialogFooter><Button type="submit">Ajouter</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
