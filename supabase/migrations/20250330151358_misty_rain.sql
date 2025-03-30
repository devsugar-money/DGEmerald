/*
  # Add action_trigger field to questions table
  
  1. New Fields
    - `action_trigger` - Specifies which answer (yes/no) triggers the action to appear in action plan
  
  2. Changes
    - Add nullable text field to questions table that can be 'yes', 'no', or null
    - When null, the action doesn't appear in action plan
*/

-- Add action_trigger column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS action_trigger text;

-- Add a comment to explain the purpose of the field
COMMENT ON COLUMN questions.action_trigger IS 'Specifies which answer (yes/no) triggers the action in action plan. Values: "yes", "no", or null';