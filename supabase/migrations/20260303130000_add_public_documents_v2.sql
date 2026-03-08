-- Add is_public column to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Update RLS policies for documents
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own or public documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

-- Policy to allow admins to delete any document
-- Using the email from GEMINI.md/Admin.tsx
CREATE POLICY "Admins can delete any document"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'aliopooopp3@gmail.com');

-- Update RLS for document_chunks
DROP POLICY IF EXISTS "Users can view own document chunks" ON document_chunks;
CREATE POLICY "Users can view own or public document chunks"
  ON document_chunks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.is_public = true
    )
  );
