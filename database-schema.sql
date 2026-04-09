-- Database Schema for Civixity Redemption System
-- Run this in your Supabase SQL editor to create the required tables

-- Redemptions table to track user redemptions
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id INTEGER NOT NULL,
  offer_title TEXT NOT NULL,
  offer_brand TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  voucher_code TEXT UNIQUE NOT NULL,
  redemption_type TEXT NOT NULL,
  validity_period TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  partner_verification TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_voucher_code ON redemptions(voucher_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_expires_at ON redemptions(expires_at);

-- RLS (Row Level Security) policies
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own redemptions
CREATE POLICY "Users can view own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own redemptions
CREATE POLICY "Users can insert own redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own redemptions
CREATE POLICY "Users can update own redemptions" ON redemptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically mark expired redemptions
CREATE OR REPLACE FUNCTION mark_expired_redemptions()
RETURNS void AS $$
BEGIN
  UPDATE redemptions 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the expiration function (optional)
-- SELECT cron.schedule('mark-expired-redemptions', '0 0 * * *', 'SELECT mark_expired_redemptions();');

-- Profiles table to store user points and other profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER DEFAULT 1247,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Donations table to track user donations to NGOs
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ngo_id INTEGER NOT NULL,
  ngo_name TEXT NOT NULL,
  ngo_category TEXT NOT NULL,
  points_donated INTEGER NOT NULL,
  donation_amount DECIMAL(10,2) NOT NULL,
  impact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for donations table
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- RLS policies for donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own donations
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own donations
CREATE POLICY "Users can insert own donations" ON donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts table for issue reports and community feed
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT,
  category TEXT,
  severity INTEGER DEFAULT 5,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  image_url TEXT,
  similar_posts INTEGER DEFAULT 0,
  ai_detected BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp);

-- RLS policies for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert posts" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments table for post discussion
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Polls tables for community voting
CREATE TABLE IF NOT EXISTS polls (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);

-- RLS policies for polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls" ON polls
  FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS poll_votes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poll_id BIGINT REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option TEXT NOT NULL,
  other_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- RLS policies for poll_votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll votes" ON poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own poll votes" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll votes" ON poll_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS poll_other_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poll_vote_id BIGINT REFERENCES poll_votes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_vote_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_other_likes_vote_id ON poll_other_likes(poll_vote_id);
CREATE INDEX IF NOT EXISTS idx_poll_other_likes_user_id ON poll_other_likes(user_id);

-- RLS policies for poll_other_likes
ALTER TABLE poll_other_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll other likes" ON poll_other_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own poll likes" ON poll_other_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poll likes" ON poll_other_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Sample data for testing (optional)
-- INSERT INTO redemptions (user_id, offer_id, offer_title, offer_brand, points_spent, voucher_code, redemption_type, validity_period, expires_at)
-- VALUES 
--   ('your-user-id-here', 1, 'Metro Card - 10 Rides', 'City Metro', 200, 'METRO10-1234567890-ABC12', 'voucher', '3 months', NOW() + INTERVAL '3 months'),
--   ('your-user-id-here', 3, 'Local Restaurant Voucher', 'FoodieHub', 400, 'FOOD250-1234567891-DEF34', 'voucher', '2 months', NOW() + INTERVAL '2 months');

-- INSERT INTO donations (user_id, ngo_id, ngo_name, ngo_category, points_donated, donation_amount, impact)
-- VALUES 
--   ('your-user-id-here', 1, 'Green Earth Foundation', 'environment', 100, 50.00, 'Plant 1 tree for every ₹50 donated'),
--   ('your-user-id-here', 2, 'Clean Water Initiative', 'health', 80, 40.00, 'Provide clean water to 1 family for a month'); 