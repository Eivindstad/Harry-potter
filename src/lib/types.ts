export type BatchStatus = 'draft' | 'processing' | 'ready_for_review' | 'finalized' | 'failed';

export interface DashboardStats {
  totalBatches: number;
  totalReceiptsProcessed: number;
  draftsCreated: number;
  emailsSent: number;
  rowsNeedingReview: number;
}

export interface ExtractedExpense {
  id: string;
  file_id: string;
  vendor_name: string | null;
  expense_date: string | null;
  currency: string | null;
  total_amount: number | null;
  vat_amount: number | null;
  category: string | null;
  traveler_name: string | null;
  receipt_number: string | null;
  booking_reference: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  review_status: 'needs_review' | 'approved';
  confidence_score: number;
}
