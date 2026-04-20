export function NewBatchPage() {
  return (
    <section>
      <h2>New Expense Batch</h2>
      <div className="dropzone">
        <p>Drag and drop receipt files here</p>
        <small>Supported: PDF, PNG, JPG, JPEG, HEIC · Max size configurable by admin settings</small>
      </div>
      <div className="card">
        <h3>Upload queue</h3>
        <ul>
          <li>taxi-london.pdf <span className="badge uploaded">uploaded</span></li>
          <li>hotel-berlin.jpg <span className="badge validating">validating</span></li>
        </ul>
      </div>
    </section>
  );
}
