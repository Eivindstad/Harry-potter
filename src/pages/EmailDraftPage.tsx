export function EmailDraftPage() {
  return (
    <section>
      <h2>Email Draft Preview</h2>
      <div className="card">
        <p><strong>To:</strong> ap@company.com</p>
        <p><strong>Cc:</strong> finance@company.com</p>
        <p><strong>Subject:</strong> Travel expenses batch April-EMEA - 2026-04-20</p>
        <hr />
        <p>Summary: 12 receipts, USD 420.23 + EUR 1202.18. 2 rows need review.</p>
        <p>Attachments: 12 original files + expense-register-April-EMEA.xlsx</p>
      </div>
    </section>
  );
}
