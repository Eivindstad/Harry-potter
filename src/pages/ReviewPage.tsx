const rows = [
  { file: 'hotel-berlin.jpg', vendor: 'Intercity Hotel', total: 540.2, category: 'Hotel', confidence: 0.94, status: 'approved' },
  { file: 'taxi-london.pdf', vendor: null, total: 48.4, category: 'Taxi / Transport', confidence: 0.61, status: 'needs_review' }
];

export function ReviewPage() {
  return (
    <section>
      <h2>Review Extracted Expenses</h2>
      <table className="table">
        <thead>
          <tr>
            <th>File</th>
            <th>Vendor</th>
            <th>Total</th>
            <th>Category</th>
            <th>Confidence</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.file}>
              <td>{r.file}</td>
              <td>{r.vendor ?? 'Needs review'}</td>
              <td>{r.total.toFixed(2)}</td>
              <td>{r.category}</td>
              <td>{Math.round(r.confidence * 100)}%</td>
              <td><span className={`badge ${r.status}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
