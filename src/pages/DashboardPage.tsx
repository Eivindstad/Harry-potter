const stats = [
  { label: 'Total batches', value: 34 },
  { label: 'Receipts processed', value: 1178 },
  { label: 'Drafts created', value: 29 },
  { label: 'Emails sent', value: 21 },
  { label: 'Rows needing review', value: 13 }
];

export function DashboardPage() {
  return (
    <section>
      <h2>Dashboard</h2>
      <p className="muted">Operational overview for travel expense processing.</p>
      <div className="card-grid">
        {stats.map((s) => (
          <article key={s.label} className="card">
            <span className="muted">{s.label}</span>
            <strong>{s.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
