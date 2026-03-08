-- Migration: Add Inventory and Skill Tree support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '{"themes": ["default"], "avatars": ["default"], "boosters": []}'::jsonb,
ADD COLUMN IF NOT EXISTS equipped_items jsonb DEFAULT '{"theme": "default", "avatar_frame": "default"}'::jsonb;

-- Create a table for Store Items (optional, can be hardcoded in frontend, but DB is better for scaling)
CREATE TABLE IF NOT EXISTS public.store_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  cost integer NOT NULL,
  type text NOT NULL, -- 'theme', 'avatar_frame', 'booster'
  asset_id text NOT NULL, -- identifier used in frontend
  icon text
);

-- Insert some default items (Themes logic is handled in frontend, this tracks ownership)
INSERT INTO public.store_items (name, description, cost, type, asset_id, icon) VALUES
('Cyberpunk Neon', 'High contrast neon aesthetics for night coding.', 50, 'theme', 'cyberpunk', 'Zap'),
('Zen Garden', 'Organic textures and calming greens.', 30, 'theme', 'zen', 'Leaf'),
('Royal Gold', 'Prestigious gold accents for top achievers.', 100, 'avatar_frame', 'gold_frame', 'Crown'),
('XP Booster (1h)', 'Double XP for the next hour.', 25, 'booster', 'xp_2x', 'Clock');
