/*
  # Decision Tree Schema

  1. New Tables
    - `surveys` - Stores survey information
    - `questions` - Stores questions with yes/no paths
    - `hints` - Stores hint information with title and content
    - `learns` - Stores learning information with title and content
    - `actions` - Stores action items for action plans
    - `terminates` - Stores termination messages
    - `sessions` - Tracks user survey sessions
    - `responses` - Stores user responses to questions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  text text NOT NULL,
  order_position integer NOT NULL,
  yes_leads_to uuid REFERENCES questions(id) ON DELETE SET NULL,
  no_leads_to uuid REFERENCES questions(id) ON DELETE SET NULL,
  hint_id uuid,
  learn_id uuid,
  action_id uuid,
  terminate_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create hints table
CREATE TABLE IF NOT EXISTS hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create learns table
CREATE TABLE IF NOT EXISTS learns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create actions table
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create terminates table
CREATE TABLE IF NOT EXISTS terminates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  answer boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE learns ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Surveys policies
CREATE POLICY "Surveys are viewable by everyone" 
ON surveys FOR SELECT USING (true);

CREATE POLICY "Users can create surveys" 
ON surveys FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their surveys" 
ON surveys FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their surveys" 
ON surveys FOR DELETE USING (auth.uid() = created_by);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" 
ON questions FOR SELECT USING (true);

CREATE POLICY "Users can create questions for surveys they own" 
ON questions FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT created_by FROM surveys WHERE id = survey_id)
);

CREATE POLICY "Users can update questions for surveys they own" 
ON questions FOR UPDATE USING (
  auth.uid() IN (SELECT created_by FROM surveys WHERE id = survey_id)
);

CREATE POLICY "Users can delete questions for surveys they own" 
ON questions FOR DELETE USING (
  auth.uid() IN (SELECT created_by FROM surveys WHERE id = survey_id)
);

-- Similar policies for other tables
-- Hints policies
CREATE POLICY "Hints are viewable by everyone" 
ON hints FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hints" 
ON hints FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hints" 
ON hints FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete hints" 
ON hints FOR DELETE USING (auth.role() = 'authenticated');

-- Learns policies
CREATE POLICY "Learns are viewable by everyone" 
ON learns FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create learns" 
ON learns FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update learns" 
ON learns FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete learns" 
ON learns FOR DELETE USING (auth.role() = 'authenticated');

-- Actions policies
CREATE POLICY "Actions are viewable by everyone" 
ON actions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create actions" 
ON actions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update actions" 
ON actions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete actions" 
ON actions FOR DELETE USING (auth.role() = 'authenticated');

-- Terminates policies
CREATE POLICY "Terminates are viewable by everyone" 
ON terminates FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create terminates" 
ON terminates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update terminates" 
ON terminates FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete terminates" 
ON terminates FOR DELETE USING (auth.role() = 'authenticated');

-- Sessions policies
CREATE POLICY "Users can view their own sessions" 
ON sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON sessions FOR DELETE USING (auth.uid() = user_id);

-- Responses policies
CREATE POLICY "Users can view their own responses" 
ON responses FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM sessions WHERE id = session_id)
);

CREATE POLICY "Users can create their own responses" 
ON responses FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM sessions WHERE id = session_id)
);

CREATE POLICY "Users can update their own responses" 
ON responses FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM sessions WHERE id = session_id)
);

CREATE POLICY "Users can delete their own responses" 
ON responses FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM sessions WHERE id = session_id)
);