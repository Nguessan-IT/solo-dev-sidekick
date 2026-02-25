import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  tva_rate: number | null;
}

interface InvoiceItem {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
}

export default function InvoiceCreate() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { product_id: "", description: "", quantity: 1, unit_price: 0, tva_rate: 18 },
  ]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          supabase.from("clients_fact_digit2").select("id, name").eq("company_id", companyId),
          supabase.from("products_fact_digit2").select("id, name, price, tva_rate").eq("company_id", companyId),
        ]);
        setClients(clientsRes.data ?? []);
        setProducts(productsRes.data ?? []);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [companyId]);

  const addItem = () =>
    setItems([...items, { product_id: "", description: "", quantity: 1, unit_price: 0, tva_rate: 18 }]);

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[i] as any)[field] = value;
    if (field === "product_id") {
      const p = products.find((pr) => pr.id === value);
      if (p) {
        newItems[i].description = p.name;
        newItems[i].unit_price = p.price;
        newItems[i].tva_rate = p.tva_rate ?? 18;
      }
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const tvaAmount = items.reduce((sum, it) => sum + (it.quantity * it.unit_price * it.tva_rate) / 100, 0);
  const total = subtotal + tvaAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    if (items.some((it) => !it.description)) {
      toast.error("Veuillez remplir la description de tous les articles");
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = `FD-${Date.now().toString(36).toUpperCase()}`;
      const { data: inv, error } = await supabase
        .from("invoices_fact_digit2")
        .insert({
          company_id: companyId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          date_issued: new Date().toISOString().split("T")[0],
          subtotal,
          tva_amount: tvaAmount,
          total_amount: total,
          status: "draft",
          notes,
        })
        .select()
        .single();

      if (error || !inv) {
        toast.error(error?.message ?? "Erreur lors de la création");
        setSaving(false);
        return;
      }

      const itemsToInsert = items.map((it) => ({
        invoice_id: inv.id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tva_rate: it.tva_rate,
        total_price: it.quantity * it.unit_price,
        product_id: it.product_id || null,
      }));

      const { error: itemsError } = await supabase.from("invoice_items_fact_digit2").insert(itemsToInsert);
      if (itemsError) {
        toast.error("Facture créée mais erreur sur les articles: " + itemsError.message);
      } else {
        toast.success("Facture créée avec succès !");
      }
      navigate("/invoices");
    } catch (err) {
      toast.error("Erreur inattendue");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!companyId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Veuillez d'abord configurer votre entreprise.</p>
            <Button className="mt-4" onClick={() => navigate("/company")}>Configurer l'entreprise</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client *</Label>
              {clients.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Aucun client trouvé.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => navigate("/clients")}>
                    Ajouter un client
                  </Button>
                </div>
              ) : (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes optionnelles..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Articles</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Produit</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={item.product_id}
                      onChange={(e) => updateItem(i, "product_id", e.target.value)}
                    >
                      <option value="">Saisie libre</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.price.toLocaleString("fr-FR")} FCFA
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description de l'article"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Prix unitaire (FCFA)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>TVA (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.tva_rate}
                      onChange={(e) => updateItem(i, "tva_rate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Ligne: {(item.quantity * item.unit_price).toLocaleString("fr-FR")} FCFA HT
                  </p>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      <Trash2 className="h-4 w-4 text-destructive mr-1" />
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Separator />

            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Sous-total : {subtotal.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-sm text-muted-foreground">
                TVA : {tvaAmount.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-lg font-bold">Total TTC : {total.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/invoices")}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || clients.length === 0}>
            {saving ? "Enregistrement..." : "Créer la facture"}
          </Button>
        </div>
      </form>
    </div>
  );
}
