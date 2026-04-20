insert into public.expense_batches (id, created_by, batch_name, status, recipient_email, cc_email, email_subject)
values
  ('8d74cbb4-157e-4558-94cb-9d2a8c6b26ef','00000000-0000-0000-0000-000000000001','April-EMEA','ready_for_review','ap@company.com','finance@company.com','Travel expenses batch April-EMEA - 2026-04-20'),
  ('5da28f81-c3ea-4216-b29a-587f4d56b4fe','00000000-0000-0000-0000-000000000001','April-US','processing','ap@company.com','controller@company.com','Travel expenses batch April-US - 2026-04-20')
on conflict do nothing;

insert into public.expense_files (batch_id, original_filename, file_type, file_path, processing_status)
values
  ('8d74cbb4-157e-4558-94cb-9d2a8c6b26ef','hotel-berlin.jpg','image/jpeg','8d74/hotel-berlin.jpg','approved'),
  ('8d74cbb4-157e-4558-94cb-9d2a8c6b26ef','taxi-london.pdf','application/pdf','8d74/taxi-london.pdf','needs_review')
on conflict do nothing;
