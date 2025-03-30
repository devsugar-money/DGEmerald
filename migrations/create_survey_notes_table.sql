-- Create survey_notes table
CREATE TABLE IF NOT EXISTS public.survey_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_id)
);

-- Add RLS policies
ALTER TABLE public.survey_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY "Users can view their own survey notes" 
  ON public.survey_notes 
  FOR SELECT 
  USING (survey_id IN (
    SELECT id FROM public.surveys WHERE created_by = auth.uid()
  ));

-- Create policy for insert
CREATE POLICY "Users can insert their own survey notes" 
  ON public.survey_notes 
  FOR INSERT 
  WITH CHECK (survey_id IN (
    SELECT id FROM public.surveys WHERE created_by = auth.uid()
  ));

-- Create policy for update
CREATE POLICY "Users can update their own survey notes" 
  ON public.survey_notes 
  FOR UPDATE 
  USING (survey_id IN (
    SELECT id FROM public.surveys WHERE created_by = auth.uid()
  ));

-- Create policy for delete
CREATE POLICY "Users can delete their own survey notes" 
  ON public.survey_notes 
  FOR DELETE 
  USING (survey_id IN (
    SELECT id FROM public.surveys WHERE created_by = auth.uid()
  ));
