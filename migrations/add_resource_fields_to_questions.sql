-- Add new columns to questions table for resource selection and file upload
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS hint_title_id UUID REFERENCES hints_title(id),
ADD COLUMN IF NOT EXISTS hint_content_id UUID REFERENCES hints_content(id),
ADD COLUMN IF NOT EXISTS learn_title_id UUID REFERENCES learn_title(id),
ADD COLUMN IF NOT EXISTS learn_content_id UUID REFERENCES learn_content(id),
ADD COLUMN IF NOT EXISTS hasUpload BOOLEAN DEFAULT false;
