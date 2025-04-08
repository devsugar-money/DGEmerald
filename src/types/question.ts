import { Question } from '../lib/supabase';

// Extend the Question type to include our new fields
export interface ExtendedQuestion extends Question {
  hint_title_id?: string | null;
  hint_content_id?: string | null;
  learn_title_id?: string | null;
  learn_content_id?: string | null;
  hasupload?: boolean;
}
