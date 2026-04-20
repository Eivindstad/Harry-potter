import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { batchId } = await req.json();

  await supabase.from('expense_batches').update({ status: 'processing' }).eq('id', batchId);

  const { data: files, error } = await supabase
    .from('expense_files')
    .select('id,file_path,file_type,file_size_bytes')
    .eq('batch_id', batchId);

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const results = [];

  for (const file of files ?? []) {
    try {
      // Individual file loop; do not combine files.
      await supabase.from('expense_files').update({ processing_status: 'validating' }).eq('id', file.id);

      const validateRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ contentType: file.file_type, fileSizeBytes: file.file_size_bytes })
      });

      if (!validateRes.ok) throw new Error(`Validation failed for ${file.file_path}`);

      await supabase.from('expense_files').update({ processing_status: 'extracting' }).eq('id', file.id);

      const extractRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ filePath: file.file_path })
      });

      if (!extractRes.ok) throw new Error(`Extraction failed for ${file.file_path}`);
      const extracted = await extractRes.json();

      await supabase.from('extracted_expenses').insert({ batch_id: batchId, file_id: file.id, ...extracted });
      await supabase.from('expense_files').update({
        processing_status: extracted.review_status === 'approved' ? 'approved' : 'needs_review',
        processed_at: new Date().toISOString()
      }).eq('id', file.id);

      results.push({ fileId: file.id, success: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown processing error';
      await supabase.from('expense_files').update({ processing_status: 'failed' }).eq('id', file.id);
      await supabase.from('audit_logs').insert({
        batch_id: batchId,
        file_id: file.id,
        event_type: 'file_processing_failed',
        event_message: message
      });
      results.push({ fileId: file.id, success: false, error: message });
      // Continue remaining files by design.
    }
  }

  await supabase.from('expense_batches').update({ status: 'ready_for_review' }).eq('id', batchId);
  return Response.json({ batchId, results });
});
