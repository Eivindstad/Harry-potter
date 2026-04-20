# Travel Expense Processor

Production-ready internal web app architecture for multi-receipt travel expense processing on Lovable Cloud (Supabase-compatible stack).

## What this includes

- **Frontend MVP (React + Vite)** with internal enterprise UI:
  - Dashboard
  - Batch list
  - New batch upload page
  - Review extracted expenses page
  - Email draft preview page
  - History page
  - Settings page
- **Database schema + RLS policies** for:
  - users
  - expense_batches
  - expense_files
  - extracted_expenses
  - email_drafts
  - audit_logs
  - app_settings
- **Storage buckets** for originals and generated Excel files.
- **Edge functions** for secure server-side processing:
  - `validate-upload`
  - `extract-receipt`
  - `orchestrate-batch`
  - `generate-excel`
  - `create-email-draft`
  - `send-email`
- **Microsoft Graph integration stubs** for Outlook draft and send.
- **Seed data** for development.

## Core processing behavior

- Supports batch uploads of many receipts.
- Backend loops over files **individually** per batch.
- File-level status and failure handling are independent.
- Failures are logged in `audit_logs` and processing continues.
- Failed files can be retried by re-running orchestration for selected file IDs (extension point).

## Environment variables (edge functions)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_MAILBOX_USER_ID=
```

## Security model

- Validation is server-side in `validate-upload`.
- Service keys and Microsoft secrets are server-only env vars.
- RLS policies restrict data access to authenticated owners.
- Audit logs capture processing failures and key events.

## Excel behavior

`generate-excel` creates an `.xlsx` workbook with all requested columns and uploads it to `expense-excel/<batch-id>/`.

## Email behavior

`create-email-draft` builds a polished HTML summary body and creates a draft in Outlook via Microsoft Graph.

`send-email` sends an existing draft by Graph message ID.

## Local dev

```bash
npm install
npm run dev
```

## Supabase / Lovable deployment sequence

1. Apply SQL migration in `supabase/migrations/001_initial_schema.sql`.
2. Optionally apply seed in `supabase/seed/seed.sql`.
3. Deploy edge functions from `supabase/functions/*`.
4. Configure environment variables for Graph and service credentials.
5. Connect auth providers and internal SSO as needed.
