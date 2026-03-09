import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, fne_api_key } = await req.json();

    if (!invoice_id || !fne_api_key) {
      return new Response(
        JSON.stringify({ error: "invoice_id et fne_api_key sont requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client to bypass RLS for logging
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user's auth token to verify identity
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Fetch invoice with items and company info via user's RLS
    const { data: invoice, error: invError } = await supabaseUser
      .from("invoices_fact_digit2")
      .select("*, invoice_items_fact_digit2(*), companies_fact_digit2(name, address, phone, email, rccm, numero_cc), clients_fact_digit2(name, address, phone, email, rccm, numero_cc)")
      .eq("id", invoice_id)
      .single();

    if (invError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Facture introuvable ou accès refusé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build FNE payload according to DGI Côte d'Ivoire format
    const fnePayload = {
      ifu: invoice.companies_fact_digit2?.rccm ?? "",
      type_facture: 0, // 0 = Facture normale
      client: {
        nom: invoice.clients_fact_digit2?.name ?? "",
        contact: invoice.clients_fact_digit2?.phone ?? "",
        ifu: invoice.clients_fact_digit2?.rccm ?? "",
        adresse: invoice.clients_fact_digit2?.address ?? "",
      },
      operateur: {
        nom: invoice.companies_fact_digit2?.name ?? "",
        adresse: invoice.companies_fact_digit2?.address ?? "",
        contact: invoice.companies_fact_digit2?.phone ?? "",
        rccm: invoice.companies_fact_digit2?.rccm ?? "",
        ncc: invoice.companies_fact_digit2?.numero_cc ?? "",
      },
      items: (invoice.invoice_items_fact_digit2 ?? []).map((item: any) => ({
        nom: item.description,
        quantite: item.quantity,
        prix_unitaire: item.unit_price,
        taux_tva: item.tva_rate ?? 18,
        montant_tva: (item.quantity * item.unit_price * (item.tva_rate ?? 18)) / 100,
        montant_ht: item.quantity * item.unit_price,
        montant_ttc: item.quantity * item.unit_price * (1 + (item.tva_rate ?? 18) / 100),
      })),
      montant_ht: invoice.subtotal ?? 0,
      montant_tva: invoice.tva_amount ?? 0,
      montant_ttc: invoice.total_amount ?? 0,
      reference_facture: invoice.invoice_number,
      date_facture: invoice.date_issued,
    };

    // Log the request (using admin client to bypass RLS)
    await supabaseAdmin.from("fne_logs_fact_digit2").insert({
      invoice_id,
      request_data: fnePayload,
      status: "submitted",
    });

    // Submit to DGI FNE API
    // NOTE: Replace with the actual DGI endpoint when available
    const DGI_FNE_URL = "https://sygnfd.impots.ci/api/invoice";

    let fneResponse: any;
    let fneStatus = "submitted";
    let fneNumber: string | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await fetch(DGI_FNE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fne_api_key}`,
        },
        body: JSON.stringify(fnePayload),
      });

      fneResponse = await response.json();

      if (response.ok && fneResponse.numero_facture_normalisee) {
        fneStatus = "validated";
        fneNumber = fneResponse.numero_facture_normalisee;
      } else {
        fneStatus = "rejected";
        errorMessage = fneResponse.message ?? fneResponse.error ?? "Rejet par la DGI";
      }
    } catch (fetchErr: any) {
      fneStatus = "rejected";
      errorMessage = `Erreur de connexion à la DGI: ${fetchErr.message}`;
      fneResponse = { error: fetchErr.message };
    }

    // Update invoice FNE status
    const updateData: any = {
      fne_status: fneStatus,
      fne_submitted_at: new Date().toISOString(),
    };
    if (fneNumber) {
      updateData.fne_number = fneNumber;
      updateData.fne_validated_at = new Date().toISOString();
    }
    if (errorMessage) {
      updateData.fne_rejection_reason = errorMessage;
    }

    await supabaseAdmin
      .from("invoices_fact_digit2")
      .update(updateData)
      .eq("id", invoice_id);

    // Log the response
    await supabaseAdmin.from("fne_logs_fact_digit2").insert({
      invoice_id,
      request_data: fnePayload,
      response_data: fneResponse,
      status: fneStatus,
      error_message: errorMessage,
    });

    // fne_api_key is NOT stored anywhere — ephemeral usage only

    return new Response(
      JSON.stringify({
        success: fneStatus === "validated",
        fne_status: fneStatus,
        fne_number: fneNumber,
        error: errorMessage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
