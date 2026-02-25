import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string;
  date_issued: string;
  total_amount: number | null;
  status: string | null;
  fne_status: string | null;
  clients_fact_digit2: { name: string } | null;
}

export default function Invoices() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!companyId) return;
    supabase.from("invoices_fact_digit2").select("*, clients_fact_digit2(name)")
      .eq("company_id", companyId).order("created_at", { ascending: false })
      .then(({ data }) => { setInvoices((data as any) ?? []); setLoading(false); });
  }, [companyId]);

  const filtered = invoices.filter((i) =>
    i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    (i.clients_fact_digit2?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string | null) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      draft: "bg-muted text-muted-foreground",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status ?? "draft"] ?? map.draft}`}>{status ?? "brouillon"}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Factures</h1>
        <Button onClick={() => navigate("/invoices/new")}><Plus className="h-4 w-4 mr-2" />Nouvelle facture</Button>
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
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant (FCFA)</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune facture</TableCell></TableRow>
              ) : filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.clients_fact_digit2?.name ?? "—"}</TableCell>
                  <TableCell>{format(new Date(inv.date_issued), "dd MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell>{(inv.total_amount ?? 0).toLocaleString("fr-FR")}</TableCell>
                  <TableCell>{statusBadge(inv.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
