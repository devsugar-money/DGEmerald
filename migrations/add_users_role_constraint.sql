-- Make sure the role field has appropriate validation
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'user')) 
  NOT VALID; -- Not validating existing data to avoid migration issues
