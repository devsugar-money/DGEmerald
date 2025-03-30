import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = Database['public']['Tables'];
export type Survey = Tables['surveys']['Row'];
export type Question = Tables['questions']['Row'];
export type Hint = Tables['hints']['Row'];
export type Learn = Tables['learns']['Row'];
export type Action = Tables['actions']['Row'];
export type Terminate = Tables['terminates']['Row'];
export type Session = Tables['sessions']['Row'];
export type Response = Tables['responses']['Row'];