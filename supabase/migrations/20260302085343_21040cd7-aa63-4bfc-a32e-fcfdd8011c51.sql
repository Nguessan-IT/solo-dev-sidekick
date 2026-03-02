-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Allow authenticated users to upload their company logo
CREATE POLICY "Users can upload company logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- Allow public to view company logos
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-logos');

-- Allow users to update their company logos
CREATE POLICY "Users can update company logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their company logos
CREATE POLICY "Users can delete company logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);