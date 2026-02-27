import React, { useState } from 'react';
import { useSchedule } from '../store/ScheduleContext';
import { suggestSubstitutionsWithAI } from '../services/aiService';
import { Users, Calendar, Loader2, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

export const Substitutions: React.FC = () => {
  const { data, addAbsence, removeAbsence, setSubstitutions } = useSchedule();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDay, setSelectedDay] = useState('الأحد');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  const handleAddAbsence = () => {
    if (!selectedTeacherId) return;
    
    const exists = data.absences.find(a => a.teacherId === selectedTeacherId && a.date === selectedDate);
    if (exists) {
      setError('هذا المعلم مسجل غائب بالفعل في هذا اليوم.');
      return;
    }

    addAbsence({
      id: `a${Date.now()}`,
      date: selectedDate,
      teacherId: selectedTeacherId,
    });
    setSelectedTeacherId('');
    setError(null);
  };

  const handleGenerateSubstitutions = async () => {
    const absentIds = data.absences.filter(a => a.date === selectedDate).map(a => a.teacherId);
    if (absentIds.length === 0) {
      setError('يرجى إضافة معلمين غائبين أولاً.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const subs = await suggestSubstitutionsWithAI(data, absentIds, selectedDate, selectedDay);
      // Map generated subs to include absenceId
      const mappedSubs = subs.map((sub: any) => ({
        ...sub,
        id: `s${Date.now()}${Math.random()}`,
        absenceId: data.absences.find(a => a.teacherId === sub.originalTeacherId && a.date === selectedDate)?.id || '',
      }));
      setSubstitutions(mappedSubs);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء توليد التبديلات.');
    } finally {
      setIsProcessing(false);
    }
  };

  const absentTeachersToday = data.absences.filter(a => a.date === selectedDate);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">إدارة الغياب والتبديلات</h1>
        <p className="text-slate-500">سجل غياب المعلمين ودع الذكاء الاصطناعي يقترح التبديلات المناسبة بدون تعارض.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Absences */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              تحديد اليوم والتاريخ
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اليوم</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-rose-600" size={20} />
              تسجيل الغياب
            </h2>
            <div className="flex gap-2 mb-6">
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">اختر المعلم الغائب...</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                ))}
              </select>
              <button
                onClick={handleAddAbsence}
                disabled={!selectedTeacherId}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
              >
                إضافة
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">المعلمون الغائبون ({absentTeachersToday.length})</h3>
              {absentTeachersToday.map(absence => {
                const teacher = data.teachers.find(t => t.id === absence.teacherId);
                return (
                  <div key={absence.id} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <span className="font-medium text-rose-800">{teacher?.name}</span>
                    <button
                      onClick={() => removeAbsence(absence.id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 p-1 rounded-lg transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                );
              })}
              {absentTeachersToday.length === 0 && (
                <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm">
                  لا يوجد غياب مسجل لهذا اليوم
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Substitutions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <RefreshCcw className="text-indigo-600" size={24} />
                التبديلات المقترحة (الاحتياط)
              </h2>
              <button
                onClick={handleGenerateSubstitutions}
                disabled={isProcessing || absentTeachersToday.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
                توليد التبديلات ذكياً
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {data.substitutions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">
                    <div className="col-span-2">الحصة</div>
                    <div className="col-span-3">المعلم الغائب</div>
                    <div className="col-span-3">المعلم البديل</div>
                    <div className="col-span-2">الفصل</div>
                    <div className="col-span-2 text-center">حالة التعارض</div>
                  </div>
                  
                  {data.substitutions.map(sub => {
                    const period = data.periods.find(p => p.id === sub.periodId);
                    const originalTeacher = data.teachers.find(t => t.id === sub.originalTeacherId);
                    const substituteTeacher = data.teachers.find(t => t.id === sub.substituteTeacherId);
                    const classroom = data.classrooms.find(c => c.id === sub.classroomId);
                    
                    return (
                      <div key={sub.id} className="grid grid-cols-12 gap-4 px-4 py-3 bg-white rounded-xl border border-slate-200 items-center hover:border-indigo-300 transition-colors">
                        <div className="col-span-2 font-medium text-slate-800">{period?.name}</div>
                        <div className="col-span-3 text-rose-600 font-medium">{originalTeacher?.name}</div>
                        <div className="col-span-3 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg inline-block w-fit">
                          {substituteTeacher?.name}
                        </div>
                        <div className="col-span-2 text-slate-600 font-medium">{classroom?.name}</div>
                        <div className="col-span-2 flex justify-center">
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                            <CheckCircle size={14} /> سليم
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                  <div className="p-6 bg-slate-50 rounded-full">
                    <RefreshCcw size={48} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-medium">لم يتم توليد تبديلات بعد</p>
                  <p className="text-sm text-center max-w-sm">
                    قم بتسجيل غياب المعلمين ثم اضغط على "توليد التبديلات ذكياً" ليقوم النظام باقتراح أفضل البدائل.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
