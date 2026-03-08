-- Migration: Add Color to Store Items
ALTER TABLE public.store_items 
ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1';

-- Update existing items with colors
UPDATE public.store_items SET color = '#ef4444' WHERE type = 'booster';
UPDATE public.store_items SET color = '#f59e0b' WHERE type = 'avatar_frame' OR icon = 'Crown';
UPDATE public.store_items SET color = '#10b981' WHERE type = 'theme' AND (icon = 'Leaf' OR asset_id = 'zen' OR asset_id = 'theme_forest');
UPDATE public.store_items SET color = '#3b82f6' WHERE asset_id = 'badge_elite';
UPDATE public.store_items SET color = '#6366f1' WHERE asset_id = 'theme_obsidian';
