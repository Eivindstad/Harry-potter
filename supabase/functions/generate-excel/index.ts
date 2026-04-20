import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import ExcelJS from 'npm:exceljs@4.4.0';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { batchId } = await req.json();

  const [{ data: batch }, { data: rows }] = await Promise.all([
    supabase.from('expense_batches').select('*').eq('id', batchId).single(),
    supabase.from('extracted_expenses').select('*, expense_files(original_filename)').eq('batch_id', batchId)
  ]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Expenses');

  ws.columns = [
    { header: 'Batch ID', key: 'batchId', width: 24 },
    { header: 'File Name', key: 'fileName', width: 30 },
    { header: 'Vendor', key: 'vendor', width: 30 },
    { header: 'Expense Date', key: 'date', width: 16 },
    { header: 'Currency', key: 'currency', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'VAT', key: 'vat', width: 12 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Traveler', key: 'traveler', width: 20 },
    { header: 'Receipt Number', key: 'receipt', width: 20 },
    { header: 'Booking Reference', key: 'booking', width: 20 },
    { header: 'City', key: 'city', width: 16 },
    { header: 'Country', key: 'country', width: 16 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Review Status', key: 'reviewStatus', width: 16 },
    { header: 'Processed Timestamp', key: 'processedAt', width: 24 }
  ];

  for (const row of rows ?? []) {
    ws.addRow({
      batchId,
      fileName: row.expense_files?.original_filename,
      vendor: row.vendor_name,
      date: row.expense_date,
      currency: row.currency,
      total: row.total_amount,
      vat: row.vat_amount,
      category: row.category,
      traveler: row.traveler_name,
      receipt: row.receipt_number,
      booking: row.booking_reference,
      city: row.city,
      country: row.country,
      notes: row.notes,
      reviewStatus: row.review_status,
      processedAt: row.updated_at
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const filePath = `${batchId}/expense-register-${batch?.batch_name ?? batchId}.xlsx`;

  await supabase.storage.from('expense-excel').upload(filePath, buffer, {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    upsert: true
  });

  await supabase.from('expense_batches').update({ excel_file_path: filePath }).eq('id', batchId);

  return Response.json({ batchId, filePath });
});
