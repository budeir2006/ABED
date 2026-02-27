import React from 'react';
import { useSchedule } from '../store/ScheduleContext';
import { Users, BookOpen, Clock, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data } = useSchedule();

  const stats = [
    { label: 'عدد المعلمين', value: data.teachers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'عدد الفصول', value: data.classrooms.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'عدد الحصص', value: data.periods.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'الغيابات المسجلة', value: data.absences.length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">مرحباً بك في مدير التبديلات</h1>
        <p className="text-slate-500">نظام ذكي لإدارة غيابات المعلمين وجداول التبديلات بكل سهولة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">الخطوات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">1</div>
            <h3 className="font-bold text-slate-800 mb-2">استيراد الجدول</h3>
            <p className="text-sm text-slate-500">قم برفع صورة الجدول أو ملف Excel ليقوم الذكاء الاصطناعي بتحليله واستخراج البيانات.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">2</div>
            <h3 className="font-bold text-slate-800 mb-2">تسجيل الغياب</h3>
            <p className="text-sm text-slate-500">حدد المعلمين الغائبين ليقوم النظام باقتراح التبديلات المناسبة تلقائياً بدون تعارض.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mb-4">3</div>
            <h3 className="font-bold text-slate-800 mb-2">تصدير وطباعة</h3>
            <p className="text-sm text-slate-500">راجع جدول التبديلات النهائي وقم بتصديره كصورة عالية الجودة جاهزة للطباعة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
