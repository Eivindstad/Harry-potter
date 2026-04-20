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
  const { batchId, to, cc, subject, autoSend = false } = await req.json();

  const { data: rows } = await supabase.from('extracted_expenses').select('*').eq('batch_id', batchId);
  const { data: files } = await supabase.from('expense_files').select('*').eq('batch_id', batchId);
  const { data: batch } = await supabase.from('expense_batches').select('*').eq('id', batchId).single();

  const totalsByCurrency = (rows ?? []).reduce((acc: Record<string, number>, item: any) => {
    if (item.currency && item.total_amount) acc[item.currency] = (acc[item.currency] ?? 0) + Number(item.total_amount);
    return acc;
  }, {});

  const needsReview = (rows ?? []).filter((r: any) => r.review_status === 'needs_review').length;
  const summaryList = Object.entries(totalsByCurrency).map(([cur, total]) => `<li>${cur}: ${total.toFixed(2)}</li>`).join('');
  const bodyHtml = `
    <p>Hello Finance Team,</p>
    <p>Please find attached travel expense batch <strong>${batch?.batch_name}</strong>.</p>
    <ul>
      <li>Number of receipts: ${(files ?? []).length}</li>
      <li>Rows needing review: ${needsReview}</li>
    </ul>
    <p>Totals by currency:</p>
    <ul>${summaryList}</ul>
  `;

  const token = await getGraphToken();
  const mailboxUserId = Deno.env.get('MS_MAILBOX_USER_ID')!;

  const draftRes = await fetch(`https://graph.microsoft.com/v1.0/users/${mailboxUserId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject,
      body: { contentType: 'HTML', content: bodyHtml },
      toRecipients: [{ emailAddress: { address: to } }],
      ccRecipients: cc ? [{ emailAddress: { address: cc } }] : []
    })
  });

  if (!draftRes.ok) {
    const errorText = await draftRes.text();
    return Response.json({ error: errorText }, { status: 400 });
  }

  const draft = await draftRes.json();

  await supabase.from('email_drafts').insert({
    batch_id: batchId,
    recipient_email: to,
    cc_email: cc,
    subject,
    body_html: bodyHtml,
    draft_external_id: draft.id,
    status: autoSend ? 'sent' : 'created'
  });

  await supabase.from('expense_batches').update({
    draft_status: 'created',
    email_subject: subject,
    email_body: bodyHtml,
    recipient_email: to,
    cc_email: cc
  }).eq('id', batchId);

  return Response.json({ batchId, draftId: draft.id, autoSend, bodyHtml });
});
