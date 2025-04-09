Existing database structure:

| table_name    | column_name       | data_type                | is_nullable | column_default    |
| ------------- | ----------------- | ------------------------ | ----------- | ----------------- |
| actions       | id                | uuid                     | NO          | gen_random_uuid() |
| actions       | content           | text                     | NO          | null              |
| actions       | created_at        | timestamp with time zone | YES         | now()             |
| hints_content | id                | uuid                     | NO          | gen_random_uuid() |
| hints_content | content           | text                     | NO          | null              |
| hints_content | created_at        | timestamp with time zone | YES         | now()             |
| hints_content | updated_at        | timestamp with time zone | YES         | now()             |
| hints_title   | id                | uuid                     | NO          | gen_random_uuid() |
| hints_title   | title             | text                     | NO          | null              |
| hints_title   | created_at        | timestamp with time zone | YES         | now()             |
| hints_title   | updated_at        | timestamp with time zone | YES         | now()             |
| learn_content | id                | uuid                     | NO          | gen_random_uuid() |
| learn_content | content           | text                     | NO          | null              |
| learn_content | created_at        | timestamp with time zone | YES         | now()             |
| learn_content | updated_at        | timestamp with time zone | YES         | now()             |
| learn_title   | id                | uuid                     | NO          | gen_random_uuid() |
| learn_title   | title             | text                     | NO          | null              |
| learn_title   | created_at        | timestamp with time zone | YES         | now()             |
| learn_title   | updated_at        | timestamp with time zone | YES         | now()             |
| questions     | id                | uuid                     | NO          | gen_random_uuid() |
| questions     | survey_id         | uuid                     | YES         | null              |
| questions     | text              | text                     | NO          | null              |
| questions     | order_position    | integer                  | NO          | null              |
| questions     | yes_leads_to      | uuid                     | YES         | null              |
| questions     | no_leads_to       | uuid                     | YES         | null              |
| questions     | hint_id           | uuid                     | YES         | null              |
| questions     | learn_id          | uuid                     | YES         | null              |
| questions     | action_id         | uuid                     | YES         | null              |
| questions     | terminate_id      | uuid                     | YES         | null              |
| questions     | created_at        | timestamp with time zone | YES         | now()             |
| questions     | action_trigger    | text                     | YES         | null              |
| questions     | terminate_trigger | text                     | YES         | null              |
| questions     | hint_title_id     | uuid                     | YES         | null              |
| questions     | hint_content_id   | uuid                     | YES         | null              |
| questions     | learn_title_id    | uuid                     | YES         | null              |
| questions     | learn_content_id  | uuid                     | YES         | null              |
| questions     | hasupload         | boolean                  | YES         | false             |