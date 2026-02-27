import React from 'react';
import { Home, Upload, Clock, Users, Printer, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'الرئيسية', icon: Home },
  { id: 'import', label: 'استيراد الجدول', icon: Upload },
  { id: 'time', label: 'إدارة الزمن', icon: Clock },
  { id: 'substitutions', label: 'إدارة التبديلات', icon: Users },
  { id: 'export', label: 'تصدير وطباعة', icon: Printer },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed right-0 top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <FileSpreadsheet size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">مدير التبديلات</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400">
        الإصدار 1.0.0
      </div>
    </div>
  );
};
