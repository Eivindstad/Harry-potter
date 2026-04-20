import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

function suggestCategory(text: string): string {
  const lc = text.toLowerCase();
  if (lc.includes('flight') || lc.includes('airline')) return 'Flight';
  if (lc.includes('hotel')) return 'Hotel';
  if (lc.includes('taxi') || lc.includes('uber') || lc.includes('lyft')) return 'Taxi / Transport';
  if (lc.includes('train') || lc.includes('rail')) return 'Train';
  if (lc.includes('meal') || lc.includes('restaurant')) return 'Meals';
  if (lc.includes('parking')) return 'Parking';
  if (lc.includes('fuel') || lc.includes('gas')) return 'Fuel';
  return 'Other';
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { filePath } = await req.json();

  // Placeholder OCR parse call; integrate Azure Document Intelligence / Microsoft AI here.
  const rawText = `Parsed OCR text for ${filePath}`;
  const category = suggestCategory(rawText);

  return Response.json({
    vendor_name: null,
    expense_date: null,
    currency: null,
    total_amount: null,
    vat_amount: null,
    subtotal_amount: null,
    payment_method: null,
    receipt_number: null,
    traveler_name: null,
    booking_reference: null,
    city: null,
    country: null,
    category,
    notes: 'Needs review',
    raw_text: rawText,
    confidence_score: 0.55,
    confidence_by_field: {
      vendor_name: 0.32,
      expense_date: 0.2,
      total_amount: 0.5,
      category: 0.8
    },
    review_status: 'needs_review'
  });
});
