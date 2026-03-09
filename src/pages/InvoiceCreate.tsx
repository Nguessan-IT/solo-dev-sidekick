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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowLeft, UserPlus, PackagePlus } from "lucide-react";
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

  // Quick create dialogs
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productDialogIndex, setProductDialogIndex] = useState<number | null>(null);
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", address: "", rccm: "", numero_cc: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "", tva_rate: "18", category: "", unit: "unité", is_service: false });
  const [savingClient, setSavingClient] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

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

  // Quick create client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSavingClient(true);
    try {
      const { data, error } = await supabase
        .from("clients_fact_digit2")
        .insert({ ...clientForm, company_id: companyId })
        .select()
        .single();
      if (error) throw error;
      toast.success("Client créé avec succès");
      setClients([data, ...clients]);
      setClientId(data.id);
      setClientDialogOpen(false);
      setClientForm({ name: "", email: "", phone: "", address: "", rccm: "", numero_cc: "" });
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du client");
    } finally {
      setSavingClient(false);
    }
  };

  // Quick create product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSavingProduct(true);
    try {
      const { data, error } = await supabase
        .from("products_fact_digit2")
        .insert({
          name: productForm.name,
          price: parseFloat(productForm.price),
          tva_rate: parseFloat(productForm.tva_rate),
          category: productForm.category || null,
          unit: productForm.unit,
          is_service: productForm.is_service,
          company_id: companyId,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Produit créé avec succès");
      setProducts([data, ...products]);
      // Auto-select in the item row if opened from there
      if (productDialogIndex !== null) {
        const newItems = [...items];
        newItems[productDialogIndex].product_id = data.id;
        newItems[productDialogIndex].description = data.name;
        newItems[productDialogIndex].unit_price = data.price;
        newItems[productDialogIndex].tva_rate = data.tva_rate ?? 18;
        setItems(newItems);
      }
      setProductDialogOpen(false);
      setProductDialogIndex(null);
      setProductForm({ name: "", price: "", tva_rate: "18", category: "", unit: "unité", is_service: false });
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du produit");
    } finally {
      setSavingProduct(false);
    }
  };

  const openProductDialog = (index: number) => {
    setProductDialogIndex(index);
    setProductDialogOpen(true);
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
              <div className="flex items-center justify-between mb-1">
                <Label>Client *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() => setClientDialogOpen(true)}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Nouveau client
                </Button>
              </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <Label>Produit</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary"
                        onClick={() => openProductDialog(i)}
                      >
                        <PackagePlus className="h-3.5 w-3.5 mr-1" />
                        Nouveau
                      </Button>
                    </div>
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
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Créer la facture"}
          </Button>
        </div>
      </form>

      {/* Dialog Nouveau Client */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Nouveau client</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div><Label>Nom *</Label><Input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} /></div>
              <div><Label>Téléphone</Label><Input value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} /></div>
            </div>
            <div><Label>Adresse</Label><Input value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>RCCM</Label><Input value={clientForm.rccm} onChange={(e) => setClientForm({ ...clientForm, rccm: e.target.value })} /></div>
              <div><Label>N° CC</Label><Input value={clientForm.numero_cc} onChange={(e) => setClientForm({ ...clientForm, numero_cc: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClientDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={savingClient}>{savingClient ? "Création..." : "Créer le client"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Nouveau Produit */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5" />Nouveau produit / service</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div><Label>Nom *</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prix (FCFA) *</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required /></div>
              <div><Label>TVA %</Label><Input type="number" value={productForm.tva_rate} onChange={(e) => setProductForm({ ...productForm, tva_rate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Catégorie</Label><Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></div>
              <div><Label>Unité</Label><Input value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_service_quick" checked={productForm.is_service} onChange={(e) => setProductForm({ ...productForm, is_service: e.target.checked })} />
              <Label htmlFor="is_service_quick">C'est un service</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={savingProduct}>{savingProduct ? "Création..." : "Créer le produit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
