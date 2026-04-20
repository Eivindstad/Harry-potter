export function SettingsPage() {
  return (
    <section>
      <h2>Settings</h2>
      <div className="form-grid">
        <label>Default recipient email<input defaultValue="ap@company.com" /></label>
        <label>Default CC email<input defaultValue="finance@company.com" /></label>
        <label>Default subject template<input defaultValue="Travel expenses batch {{batch_name}} - {{date}}" /></label>
        <label>Allowed file types<input defaultValue="pdf,png,jpg,jpeg,heic" /></label>
        <label>Max file size (MB)<input type="number" defaultValue={15} /></label>
      </div>
    </section>
  );
}
