import { NavLink, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, History, Mail, Settings, Upload, FolderKanban } from 'lucide-react';
import { DashboardPage } from './pages/DashboardPage';
import { NewBatchPage } from './pages/NewBatchPage';
import { BatchesPage } from './pages/BatchesPage';
import { ReviewPage } from './pages/ReviewPage';
import { EmailDraftPage } from './pages/EmailDraftPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/batches', label: 'Batches', icon: FolderKanban },
  { to: '/new-batch', label: 'New Batch', icon: Upload },
  { to: '/review', label: 'Review', icon: Mail },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Travel Expense Processor</h1>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className="nav-link">
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/new-batch" element={<NewBatchPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/review/:batchId/email" element={<EmailDraftPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
