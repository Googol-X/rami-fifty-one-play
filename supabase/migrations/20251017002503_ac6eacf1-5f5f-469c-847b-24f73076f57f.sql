-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Create separate player_hands table with proper RLS
CREATE TABLE IF NOT EXISTS public.player_hands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_index integer NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(game_id, player_id),
  UNIQUE(game_id, player_index)
);

-- Enable RLS on player_hands
ALTER TABLE public.player_hands ENABLE ROW LEVEL SECURITY;

-- Players can only see their own hand
CREATE POLICY "Players can view their own hand"
ON public.player_hands
FOR SELECT
TO authenticated
USING (auth.uid() = player_id);

-- Players can insert their own hand
CREATE POLICY "Players can insert their own hand"
ON public.player_hands
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = player_id);

-- Players can update their own hand
CREATE POLICY "Players can update their own hand"
ON public.player_hands
FOR UPDATE
TO authenticated
USING (auth.uid() = player_id);

-- Host can insert hands for all players when initializing game
CREATE POLICY "Host can insert all hands when creating game"
ON public.player_hands
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.games
    WHERE games.id = player_hands.game_id
    AND games.host_id = auth.uid()
  )
);

-- Host can update all hands during gameplay
CREATE POLICY "Host can update all hands during gameplay"
ON public.player_hands
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.games
    WHERE games.id = player_hands.game_id
    AND games.host_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_player_hands_updated_at
BEFORE UPDATE ON public.player_hands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove player_hands from game_state (keep the column but it won't be used)
-- We'll handle this in the application code to maintain backward compatibility

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_player_hands_game_id ON public.player_hands(game_id);
CREATE INDEX IF NOT EXISTS idx_player_hands_player_id ON public.player_hands(player_id);