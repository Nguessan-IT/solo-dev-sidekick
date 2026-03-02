import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinancialReport {
  id: string;
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  tva: number;
  invoices_count: number;
  clients_count: number;
  products_count: number;
  created_at: string;
}

export default function Reports() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    supabase
      .from("financial_reports_fact_digit2")
      .select("id, period, revenue, expenses, profit, tva, invoices_count, clients_count, products_count, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReports(data ?? []);
        setLoading(false);
      });
  }, [companyId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-xl font-bold">Bilans Financiers</h1>
      </div>

      {loading ? (
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">Aucun bilan financier</p>
            <p className="text-sm text-muted-foreground/70">Les bilans générés apparaîtront ici</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {r.period}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Revenus</span><p className="font-semibold">{r.revenue.toLocaleString("fr-FR")} FCFA</p></div>
                  <div><span className="text-muted-foreground">Dépenses</span><p className="font-semibold">{r.expenses.toLocaleString("fr-FR")} FCFA</p></div>
                  <div><span className="text-muted-foreground">Bénéfice</span><p className="font-semibold">{r.profit.toLocaleString("fr-FR")} FCFA</p></div>
                  <div><span className="text-muted-foreground">TVA</span><p className="font-semibold">{r.tva.toLocaleString("fr-FR")} FCFA</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
