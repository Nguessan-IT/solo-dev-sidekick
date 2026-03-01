import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Company {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  rccm: string | null;
  numero_cc: string | null;
  logo_url: string | null;
}

interface Client {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  rccm: string | null;
  numero_cc: string | null;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number | null;
  total_price: number | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date_issued: string;
  date_due: string | null;
  subtotal: number | null;
  tva_amount: number | null;
  total_amount: number | null;
  status: string | null;
  fne_status: string | null;
  fne_number: string | null;
  notes: string | null;
  terms: string | null;
}

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !companyId) return;

    const fetchAll = async () => {
      try {
        const [invRes, compRes] = await Promise.all([
          supabase
            .from("invoices_fact_digit2")
            .select("*")
            .eq("id", id)
            .single(),
          supabase
            .from("companies_fact_digit2")
            .select("name, address, phone, email, rccm, numero_cc, logo_url")
            .eq("id", companyId)
            .single(),
        ]);

        if (invRes.data) {
          setInvoice(invRes.data);
          // Fetch client & items
          const [clientRes, itemsRes] = await Promise.all([
            supabase
              .from("clients_fact_digit2")
              .select("name, address, phone, email, rccm, numero_cc")
              .eq("id", invRes.data.client_id)
              .single(),
            supabase
              .from("invoice_items_fact_digit2")
              .select("*")
              .eq("invoice_id", id),
          ]);
          setClient(clientRes.data);
          setItems(itemsRes.data ?? []);
        }
        setCompany(compRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement de la facture");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, companyId]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    try {
      toast.info("Génération du PDF...");
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Facture_${invoice?.invoice_number ?? "FD"}.pdf`);
      toast.success("PDF téléchargé !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-96 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Facture introuvable.
          </CardContent>
        </Card>
      </div>
    );
  }

  const fneLabel = (s: string | null) => {
    const map: Record<string, string> = {
      validated: "✅ Validée DGI",
      submitted: "⏳ En cours",
      rejected: "❌ Rejetée",
      draft: "Brouillon",
    };
    return map[s ?? "draft"] ?? s;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Actions bar */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
           <div ref={invoiceRef} className="relative bg-white text-black p-8 min-h-[297mm] overflow-hidden" style={{ fontFamily: "'Consolas', 'Courier New', monospace", fontSize: "11px" }}>
            {/* Watermark / Filigrane */}
            {company?.logo_url ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img
                  src={company.logo_url}
                  alt=""
                  className="w-[400px] h-[400px] object-contain"
                  style={{ opacity: 0.04 }}
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <span className="font-bold text-gray-200 select-none" style={{ fontSize: "72px", opacity: 0.06, transform: "rotate(-30deg)" }}>
                  {company?.name}
                </span>
              </div>
            )}

            {/* Subtle background pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.03) 0%, transparent 50%)" }} />

            {/* Content layer */}
            <div className="relative" style={{ zIndex: 1 }}>

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start gap-4">
                {company?.logo_url && (
                  <img
                    src={company.logo_url}
                    alt="Logo"
                    className="h-24 w-24 object-contain rounded-lg shadow-sm border border-gray-100"
                    crossOrigin="anonymous"
                  />
                )}
                <div>
                  <h2 className="font-bold text-gray-900" style={{ fontSize: "13px" }}>{company?.name}</h2>
                  {company?.address && <p className="text-gray-600">{company.address}</p>}
                  {company?.phone && <p className="text-gray-600">Tél: {company.phone}</p>}
                  {company?.email && <p className="text-gray-600">{company.email}</p>}
                  {company?.rccm && <p className="text-gray-600">RCCM: {company.rccm}</p>}
                  {company?.numero_cc && <p className="text-gray-600">N° CC: {company.numero_cc}</p>}
                </div>
              </div>
              <div className="text-right">
                <h1 className="font-bold" style={{ fontSize: "13px", color: "#2563eb" }}>FACTURE</h1>
                <p className="text-gray-600 mt-1">N° {invoice.invoice_number}</p>
                {invoice.fne_number && (
                  <p className="font-medium mt-1" style={{ color: "#15803d" }}>
                    FNE: {invoice.fne_number}
                  </p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-500 uppercase mb-2" style={{ fontSize: "11px" }}>Facturé à</h3>
                <p className="font-semibold text-gray-900">{client?.name}</p>
                {client?.address && <p className="text-sm text-gray-600">{client.address}</p>}
                {client?.phone && <p className="text-sm text-gray-600">Tél: {client.phone}</p>}
                {client?.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client?.rccm && <p className="text-sm text-gray-600">RCCM: {client.rccm}</p>}
                {client?.numero_cc && <p className="text-sm text-gray-600">N° CC: {client.numero_cc}</p>}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-500 uppercase mb-2" style={{ fontSize: "11px" }}>Détails</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date d'émission:</span>
                    <span className="font-medium">{format(new Date(invoice.date_issued), "dd MMMM yyyy", { locale: fr })}</span>
                  </div>
                  {invoice.date_due && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date d'échéance:</span>
                      <span className="font-medium">{format(new Date(invoice.date_due), "dd MMMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full mb-8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left p-3 text-sm font-semibold">Description</th>
                  <th className="text-center p-3 text-sm font-semibold">Qté</th>
                  <th className="text-right p-3 text-sm font-semibold">P.U. (FCFA)</th>
                  <th className="text-center p-3 text-sm font-semibold">TVA %</th>
                  <th className="text-right p-3 text-sm font-semibold">Total HT (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unit_price;
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td className="p-3 text-sm text-gray-900">{item.description}</td>
                      <td className="p-3 text-sm text-center text-gray-700">{item.quantity}</td>
                      <td className="p-3 text-sm text-right text-gray-700">{item.unit_price.toLocaleString("fr-FR")}</td>
                      <td className="p-3 text-sm text-center text-gray-700">{item.tva_rate ?? 18}%</td>
                      <td className="p-3 text-sm text-right font-medium text-gray-900">{lineTotal.toLocaleString("fr-FR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total HT</span>
                  <span>{(invoice.subtotal ?? 0).toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>TVA</span>
                  <span>{(invoice.tva_amount ?? 0).toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="border-t-2 border-blue-600 pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total TTC</span>
                  <span>{(invoice.total_amount ?? 0).toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="font-semibold text-gray-500 uppercase mb-1" style={{ fontSize: "11px" }}>Notes</h3>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Footer - Conformité */}
            <div className="border-t border-gray-200 pt-4 mt-auto">
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p className="font-semibold">Facture conforme au format normalisé — République de Côte d'Ivoire</p>
                <p>Direction Générale des Impôts (DGI) — Système de Facture Normalisée Électronique (FNE)</p>
                {company?.rccm && <p>RCCM: {company.rccm} | N° CC: {company?.numero_cc ?? "—"}</p>}
                <p>{company?.name} — {company?.address ?? ""} — {company?.phone ?? ""}</p>
              </div>
            </div>
            </div> {/* end content layer */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
