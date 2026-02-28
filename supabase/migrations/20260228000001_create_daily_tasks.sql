-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_text text NOT NULL,
  is_completed boolean DEFAULT false,
  scheduled_date date DEFAULT CURRENT_DATE NOT NULL,
  scheduled_time time,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own tasks"
  ON daily_tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS daily_tasks_user_date_idx ON daily_tasks(user_id, scheduled_date);
