import React, { useState } from 'react';
import { useSchedule } from '../store/ScheduleContext';
import { Clock, Plus, Trash2, Save } from 'lucide-react';

export const TimeManagement: React.FC = () => {
  const { data, setData } = useSchedule();
  const [periods, setPeriods] = useState(data.periods);

  const handleAddPeriod = () => {
    const newId = `p${periods.length + 1}`;
    setPeriods([
      ...periods,
      { id: newId, name: `الحصة ${periods.length + 1}`, startTime: '08:00', endTime: '08:45', isBreak: false },
    ]);
  };

  const handleRemovePeriod = (id: string) => {
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const handleUpdatePeriod = (id: string, field: keyof typeof periods[0], value: any) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSave = () => {
    setData({ ...data, periods });
    alert('تم حفظ إعدادات الزمن بنجاح!');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">إدارة الزمن المدرسي</h1>
          <p className="text-slate-500">قم بضبط أوقات الحصص والاستراحات لليوم الدراسي.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Save size={20} />
          حفظ التعديلات
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-indigo-600" size={24} />
            الجدول الزمني للحصص
          </h2>
          <button
            onClick={handleAddPeriod}
            className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border border-indigo-200"
          >
            <Plus size={18} />
            إضافة حصة / استراحة
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-semibold text-slate-500 px-4">
            <div className="col-span-4">الاسم</div>
            <div className="col-span-3">وقت البداية</div>
            <div className="col-span-3">وقت النهاية</div>
            <div className="col-span-1 text-center">استراحة؟</div>
            <div className="col-span-1 text-center">إجراء</div>
          </div>

          <div className="space-y-3">
            {periods.map((period, index) => (
              <div
                key={period.id}
                className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all ${
                  period.isBreak ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    value={period.name}
                    onChange={(e) => handleUpdatePeriod(period.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-medium placeholder-slate-400"
                    placeholder="اسم الحصة أو الاستراحة"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={period.startTime}
                    onChange={(e) => handleUpdatePeriod(period.id, 'startTime', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={period.endTime}
                    onChange={(e) => handleUpdatePeriod(period.id, 'endTime', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={period.isBreak}
                    onChange={(e) => handleUpdatePeriod(period.id, 'isBreak', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleRemovePeriod(period.id)}
                    className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {periods.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                لا توجد حصص مضافة. انقر على "إضافة حصة" للبدء.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
