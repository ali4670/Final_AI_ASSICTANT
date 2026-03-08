-- Migration: Populate Store Items
-- This migration populates the store_items table with more diverse items.

-- First, clear existing to avoid duplicates if re-run (though id is uuid)
-- DELETE FROM public.store_items;

INSERT INTO public.store_items (name, description, cost, type, asset_id, icon) VALUES
('Obsidian Night', 'Deep space aesthetic for your neural hub.', 50, 'theme', 'theme_obsidian', 'Palette'),
('Zen Ambience', 'High-performance audio loop for deep focus.', 30, 'theme', 'ambience_zen', 'Music'),
('Gold Neural Frame', 'Elite neural identifier border.', 100, 'theme', 'frame_gold', 'Crown'),
('XP Overclock (24h)', '2x XP gain for the next 24 hours.', 150, 'booster', 'booster_xp_2x', 'Zap'),
('Biological Forest', 'Biological growth environment skin.', 50, 'theme', 'theme_forest', 'Leaf'),
('Veteran Badge', 'Display your veteran status in the hall.', 200, 'theme', 'badge_elite', 'Shield')
ON CONFLICT DO NOTHING;
