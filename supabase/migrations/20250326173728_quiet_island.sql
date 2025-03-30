/*
  # Add Missing Foreign Key Relationships
  
  1. Changes
    - Add foreign key relationships from questions table to:
      - hints (hint_id references hints.id)
      - learns (learn_id references learns.id)
      - actions (action_id references actions.id)
      - terminates (terminate_id references terminates.id)
  
  2. Security
    - No changes to row level security policies
*/

-- Add foreign key relationship between questions.hint_id and hints.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_hint_id_fkey'
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions
    ADD CONSTRAINT questions_hint_id_fkey
    FOREIGN KEY (hint_id) REFERENCES hints(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key relationship between questions.learn_id and learns.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_learn_id_fkey'
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions
    ADD CONSTRAINT questions_learn_id_fkey
    FOREIGN KEY (learn_id) REFERENCES learns(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key relationship between questions.action_id and actions.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_action_id_fkey'
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions
    ADD CONSTRAINT questions_action_id_fkey
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key relationship between questions.terminate_id and terminates.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_terminate_id_fkey'
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions
    ADD CONSTRAINT questions_terminate_id_fkey
    FOREIGN KEY (terminate_id) REFERENCES terminates(id) ON DELETE SET NULL;
  END IF;
END $$;