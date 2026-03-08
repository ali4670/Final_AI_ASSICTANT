-- Migration: Add Social and Messenger Support
-- 1. Create Friends Table
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url text,
  is_seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Friends
CREATE POLICY "Users can view their own friend connections" 
  ON public.friends FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" 
  ON public.friends FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own received requests" 
  ON public.friends FOR UPDATE 
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own friend connections" 
  ON public.friends FOR DELETE 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 5. Policies for Messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update seen status of received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS friends_sender_id_idx ON public.friends(sender_id);
CREATE INDEX IF NOT EXISTS friends_receiver_id_idx ON public.friends(receiver_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at ASC);
