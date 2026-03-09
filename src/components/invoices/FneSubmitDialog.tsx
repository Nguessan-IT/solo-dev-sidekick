import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

interface FneSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  onSuccess: (fneNumber: string) => void;
}

export function FneSubmitDialog({ open, onOpenChange, invoiceId, invoiceNumber, onSuccess }: FneSubmitDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast.error("Veuillez saisir votre clé API FNE");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-fne", {
        body: { invoice_id: invoiceId, fne_api_key: apiKey },
      });

      // Clear key from memory immediately
      setApiKey("");

      if (error) throw error;

      if (data.success) {
        toast.success(`Facture normalisée ! N° FNE: ${data.fne_number}`);
        onSuccess(data.fne_number);
        onOpenChange(false);
      } else {
        toast.error(data.error ?? "La DGI a rejeté la facture");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la soumission FNE");
    } finally {
      setApiKey("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setApiKey(""); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Normalisation FNE — DGI
          </DialogTitle>
          <DialogDescription>
            Facture <strong>{invoiceNumber}</strong> — Saisissez votre clé API DGI pour soumettre cette facture à la normalisation. La clé ne sera jamais stockée.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fne-key">Clé API FNE (DGI)</Label>
            <Input
              id="fne-key"
              type="password"
              placeholder="Entrez votre clé API FNE..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              data-lpignore="true"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            🔒 Votre clé est utilisée uniquement pour cette transaction et supprimée immédiatement après.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setApiKey(""); onOpenChange(false); }} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !apiKey.trim()}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
            Soumettre à la DGI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
