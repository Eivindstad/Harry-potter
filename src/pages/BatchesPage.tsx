const batches = [
  { id: 'BATCH-1042', status: 'processing', files: 8, createdAt: '2026-04-20 08:45 UTC' },
  { id: 'BATCH-1041', status: 'ready_for_review', files: 12, createdAt: '2026-04-19 16:22 UTC' }
];

export function BatchesPage() {
  return (
    <section>
      <h2>Expense Batches</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Status</th>
            <th>Files</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td><span className={`badge ${b.status}`}>{b.status}</span></td>
              <td>{b.files}</td>
              <td>{b.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
