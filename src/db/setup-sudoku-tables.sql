-- ===========================================
-- AG SUDOKU - DATABASE SETUP
-- ===========================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates Sudoku-specific tables in the existing AlexGoiko Supabase project
-- All tables are prefixed with "sudoku_" to avoid conflicts with main site tables

-- Sudoku Game Statistics (per user, per difficulty)
CREATE TABLE IF NOT EXISTS sudoku_game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('medium', 'expert', 'pro')),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  avg_time_seconds INTEGER,
  total_time_seconds INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  mistakes_total INTEGER DEFAULT 0,
  perfect_games INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, difficulty)
);

-- Sudoku Game History (individual games, for leaderboards)
CREATE TABLE IF NOT EXISTS sudoku_game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('medium', 'expert', 'pro')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_seconds INTEGER NOT NULL,
  mistakes INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  is_win BOOLEAN DEFAULT FALSE,
  is_perfect BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0
);

-- Sudoku Achievements/Badges
CREATE TABLE IF NOT EXISTS sudoku_achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- emoji
  category VARCHAR(50) CHECK (category IN ('gameplay', 'streak', 'special', 'speed')),
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  xp_reward INTEGER DEFAULT 0
);

-- User Achievements (which badges each user has unlocked)
CREATE TABLE IF NOT EXISTS sudoku_user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES sudoku_achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Sudoku Player Profiles (extends the main site's profile)
CREATE TABLE IF NOT EXISTS sudoku_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(15),
  avatar_id VARCHAR(50) DEFAULT 'blinky',
  avatar_color VARCHAR(7) DEFAULT '#4CAF50',
  frame_id VARCHAR(50) DEFAULT 'basic',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  total_games_won INTEGER DEFAULT 0,
  total_playtime_seconds INTEGER DEFAULT 0,
  pro_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE sudoku_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sudoku_game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sudoku_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sudoku_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sudoku_achievements ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLICIES: Users can only read/write their own data
-- ===========================================

-- Game Stats policies
CREATE POLICY "Users can view own stats" ON sudoku_game_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON sudoku_game_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON sudoku_game_stats FOR UPDATE USING (auth.uid() = user_id);

-- Game History policies
CREATE POLICY "Users can view own history" ON sudoku_game_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON sudoku_game_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Achievements policies
CREATE POLICY "Users can view own achievements" ON sudoku_user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON sudoku_user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sudoku Profile policies
CREATE POLICY "Users can view own sudoku profile" ON sudoku_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sudoku profile" ON sudoku_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sudoku profile" ON sudoku_profiles FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- PUBLIC READ POLICIES (for leaderboards)
-- ===========================================

-- Anyone can see game history for rankings
CREATE POLICY "Public can view game history for leaderboard" ON sudoku_game_history FOR SELECT USING (true);

-- Anyone can view sudoku profiles for leaderboard
CREATE POLICY "Public can view sudoku profiles for leaderboard" ON sudoku_profiles FOR SELECT USING (true);

-- Achievements definitions are public (not user data)
CREATE POLICY "Anyone can read achievements" ON sudoku_achievements FOR SELECT USING (true);

-- ===========================================
-- SEED INITIAL ACHIEVEMENTS
-- ===========================================

INSERT INTO sudoku_achievements (id, name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
  ('first_win', 'First Win', 'Win your first game', '🏆', 'gameplay', 'total_wins', 1, 10),
  ('getting_started', 'Getting Started', 'Win 5 games', '⭐', 'gameplay', 'total_wins', 5, 25),
  ('dedicated', 'Dedicated', 'Win 25 games', '💪', 'gameplay', 'total_wins', 25, 50),
  ('master', 'Master', 'Win 100 games', '👑', 'gameplay', 'total_wins', 100, 150),
  ('perfect_game', 'Perfect Game', 'Win with zero mistakes', '💎', 'gameplay', 'perfect_games', 1, 50),
  ('speed_demon', 'Speed Demon', 'Win Medium in under 5 minutes', '⚡', 'speed', 'medium_fast', 300, 75),
  ('expert_solver', 'Expert Solver', 'Win Expert in under 10 minutes', '🧠', 'speed', 'expert_fast', 600, 100),
  ('no_hints', 'No Hints Needed', 'Win without using any hints', '🎯', 'gameplay', 'no_hints_win', 1, 40),
  ('on_fire', 'On Fire', '3 win streak', '🔥', 'streak', 'win_streak', 3, 25),
  ('unstoppable', 'Unstoppable', '10 win streak', '💥', 'streak', 'win_streak', 10, 75),
  ('legend', 'Legend', '30 win streak', '🌟', 'streak', 'win_streak', 30, 250),
  ('polyglot', 'Polyglot', 'Play in 3 different languages', '🌍', 'special', 'languages_used', 3, 30),
  ('night_owl', 'Night Owl', 'Play 10 games after midnight', '🦉', 'special', 'night_games', 10, 30),
  ('pro_player', 'Pro Player', 'Unlock Pro difficulty', '💀', 'special', 'pro_unlocked', 1, 200)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- WEEKLY LEADERBOARD VIEW
-- ===========================================

CREATE OR REPLACE VIEW sudoku_leaderboard_weekly AS
SELECT
  sp.user_id,
  sp.nickname,
  sp.avatar_id,
  sp.avatar_color,
  sp.frame_id,
  sp.level,
  COUNT(gh.id) as games_won,
  MIN(gh.time_seconds) as best_time,
  SUM(gh.xp_earned) as weekly_xp
FROM sudoku_profiles sp
JOIN sudoku_game_history gh ON sp.user_id = gh.user_id
WHERE gh.completed_at > NOW() - INTERVAL '7 days'
  AND gh.is_win = true
GROUP BY sp.user_id, sp.nickname, sp.avatar_id, sp.avatar_color, sp.frame_id, sp.level
ORDER BY weekly_xp DESC
LIMIT 50;

-- ===========================================
-- HELPER FUNCTION: Update timestamp on row update
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sudoku_game_stats_updated_at
  BEFORE UPDATE ON sudoku_game_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sudoku_profiles_updated_at
  BEFORE UPDATE ON sudoku_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
