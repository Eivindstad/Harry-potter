import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const DEFAULT_ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/heic'];

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { contentType, fileSizeBytes, settings } = await req.json();
  const allowed = settings?.allowed_file_types ?? DEFAULT_ALLOWED;
  const maxMb = settings?.max_file_size_mb ?? 15;

  if (!allowed.includes(contentType)) {
    return Response.json({ valid: false, reason: `File type ${contentType} is not allowed.` }, { status: 400 });
  }

  if (fileSizeBytes > maxMb * 1024 * 1024) {
    return Response.json({ valid: false, reason: `File exceeds max size ${maxMb}MB.` }, { status: 400 });
  }

  return Response.json({ valid: true });
});
