Existing database structure:

| column_name  | data_type                | is_nullable | column_default    |
| ------------ | ------------------------ | ----------- | ----------------- |
| id           | uuid                     | NO          | gen_random_uuid() |
| session_id   | uuid                     | YES         | null              |
| terminate_id | uuid                     | YES         | null              |
| file_path    | text                     | NO          | null              |
| file_name    | text                     | NO          | null              |
| file_type    | text                     | NO          | null              |
| file_size    | integer                  | NO          | null              |
| created_at   | timestamp with time zone | YES         | now()             |


| constraint_name | column_name |
| --------------- | ----------- |
| uploads_pkey    | id          |

| constraint_name           | column_name  | foreign_table_schema | foreign_table_name | foreign_column_name |
| ------------------------- | ------------ | -------------------- | ------------------ | ------------------- |
| uploads_session_id_fkey   | session_id   | public               | sessions           | id                  |
| uploads_terminate_id_fkey | terminate_id | public               | terminates         | id                  |

| indexname                | indexdef                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| uploads_pkey             | CREATE UNIQUE INDEX uploads_pkey ON public.uploads USING btree (id)                |
| uploads_session_id_idx   | CREATE INDEX uploads_session_id_idx ON public.uploads USING btree (session_id)     |
| uploads_terminate_id_idx | CREATE INDEX uploads_terminate_id_idx ON public.uploads USING btree (terminate_id) |


| policyname                         | permissive | roles    | cmd    | qual                                                                                                   | with_check                                                                                             |
| ---------------------------------- | ---------- | -------- | ------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Users can delete their own uploads | PERMISSIVE | {public} | DELETE | (auth.uid() IN ( SELECT sessions.user_id
   FROM sessions
  WHERE (sessions.id = uploads.session_id))) | null                                                                                                   |
| Users can insert their own uploads | PERMISSIVE | {public} | INSERT | null                                                                                                   | (auth.uid() IN ( SELECT sessions.user_id
   FROM sessions
  WHERE (sessions.id = uploads.session_id))) |
| Users can update their own uploads | PERMISSIVE | {public} | UPDATE | (auth.uid() IN ( SELECT sessions.user_id
   FROM sessions
  WHERE (sessions.id = uploads.session_id))) | null                                                                                                   |
| Users can view their own uploads   | PERMISSIVE | {public} | SELECT | (auth.uid() IN ( SELECT sessions.user_id
   FROM sessions
  WHERE (sessions.id = uploads.session_id))) | null                                                                                                   |

  | relrowsecurity |
| -------------- |
| true           |