-- Create neural_summaries table
CREATE TABLE IF NOT EXISTS neural_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary_text text NOT NULL,
  quiz_data jsonb DEFAULT '[]'::jsonb,
  exam_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE neural_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own neural summaries"
  ON neural_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own neural summaries"
  ON neural_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own neural summaries"
  ON neural_summaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS neural_summaries_document_id_idx ON neural_summaries(document_id);
CREATE INDEX IF NOT EXISTS neural_summaries_user_id_idx ON neural_summaries(user_id);
