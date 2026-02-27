import React, { useState } from 'react';
import { ScheduleProvider } from './store/ScheduleContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ImportSchedule } from './pages/ImportSchedule';
import { TimeManagement } from './pages/TimeManagement';
import { Substitutions } from './pages/Substitutions';
import { Export } from './pages/Export';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'import':
        return <ImportSchedule />;
      case 'time':
        return <TimeManagement />;
      case 'substitutions':
        return <Substitutions />;
      case 'export':
        return <Export />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ScheduleProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans" dir="rtl">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 mr-64 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </ScheduleProvider>
  );
}

