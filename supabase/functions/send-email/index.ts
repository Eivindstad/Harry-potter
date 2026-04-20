import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function getGraphToken() {
  const tenantId = Deno.env.get('MS_TENANT_ID')!;
  const clientId = Deno.env.get('MS_CLIENT_ID')!;
  const clientSecret = Deno.env.get('MS_CLIENT_SECRET')!;
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: 'POST', body: form });
  const json = await res.json();
  return json.access_token as string;
}

serve(async (req) => {
  const { draftId, batchId } = await req.json();
  const token = await getGraphToken();
  const mailboxUserId = Deno.env.get('MS_MAILBOX_USER_ID')!;

  const sendRes = await fetch(`https://graph.microsoft.com/v1.0/users/${mailboxUserId}/messages/${draftId}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!sendRes.ok) return Response.json({ error: await sendRes.text() }, { status: 400 });

  await supabase.from('email_drafts').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('draft_external_id', draftId);
  await supabase.from('expense_batches').update({ sent_status: 'sent' }).eq('id', batchId);

  return Response.json({ sent: true, draftId, batchId });
});
