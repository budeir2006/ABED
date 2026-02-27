import React, { useRef, useState } from 'react';
import { useSchedule } from '../store/ScheduleContext';
import { Printer, Download, Image as ImageIcon, FileText, Settings, Code } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const Export: React.FC = () => {
  const { data, updateSchoolInfo } = useSchedule();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `جدول_التبديلات_${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('حدث خطأ أثناء تصدير الصورة.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`جدول_التبديلات_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('حدث خطأ أثناء تصدير PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadApp = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/download-app');
      
      if (!response.ok) {
        throw new Error('فشل في تحميل التطبيق');
      }
      
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'مدير_التبديلات_المدرسية.html';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('تم تحميل التطبيق كملف HTML مستقل بنجاح. يمكنك فتحه في أي متصفح للعمل عليه.');
    } catch (error) {
      console.error('Error downloading app:', error);
      alert('حدث خطأ أثناء محاولة تحميل التطبيق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSchoolInfo({ logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Group substitutions by period for better display
  const groupedSubs = data.substitutions.reduce((acc, sub) => {
    if (!acc[sub.periodId]) acc[sub.periodId] = [];
    acc[sub.periodId].push(sub);
    return acc;
  }, {} as Record<string, typeof data.substitutions>);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">تصدير وطباعة الجدول</h1>
          <p className="text-slate-500">قم بتخصيص مظهر الجدول وتصديره كصورة عالية الدقة أو طباعته مباشرة.</p>
        </div>
        
        <div className="flex gap-3 flex-wrap justify-end">
          <button
            onClick={handleDownloadApp}
            disabled={isExporting}
            className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            title="تحميل التطبيق كملف مستقل"
          >
            <Code size={20} />
            {isExporting ? 'جاري التحميل...' : 'تطبيق مستقل (HTML)'}
          </button>
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer size={20} />
            طباعة
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-white hover:bg-slate-50 text-rose-600 border border-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileText size={20} />
            تصدير PDF
          </button>
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <ImageIcon size={20} />
            تصدير صورة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="text-indigo-600" size={20} />
              إعدادات الترويسة
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المدرسة</label>
                <input
                  type="text"
                  value={data.schoolInfo.name}
                  onChange={(e) => updateSchoolInfo({ name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">شعار المدرسة</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-slate-50">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>رفع صورة</span>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 overflow-auto bg-slate-100 p-8 rounded-3xl border border-slate-200 flex justify-center items-start min-h-[600px]">
          {/* Printable Container */}
          <div 
            ref={printRef} 
            className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl p-12 print:shadow-none print:p-0"
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-8">
              <div className="text-right flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{data.schoolInfo.name}</h2>
                <p className="text-lg text-slate-600">إدارة الشؤون التعليمية - جدول حصص الانتظار</p>
              </div>
              
              <div className="flex-1 flex justify-center">
                {data.schoolInfo.logoUrl ? (
                  <img src={data.schoolInfo.logoUrl} alt="شعار المدرسة" className="h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-slate-400 text-sm">
                    الشعار
                  </div>
                )}
              </div>
              
              <div className="text-left flex-1">
                <p className="text-lg font-bold text-slate-800 mb-1">
                  اليوم: {format(new Date(), 'EEEE', { locale: ar })}
                </p>
                <p className="text-lg text-slate-600">
                  التاريخ: {format(new Date(), 'yyyy/MM/dd')}
                </p>
              </div>
            </div>

            {/* Content */}
            {data.substitutions.length > 0 ? (
              <table className="w-full border-collapse border-2 border-slate-800 text-center">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border-2 border-slate-800 p-3 text-lg font-bold w-24">الحصة</th>
                    <th className="border-2 border-slate-800 p-3 text-lg font-bold">المعلم الغائب</th>
                    <th className="border-2 border-slate-800 p-3 text-lg font-bold">المعلم البديل (الاحتياط)</th>
                    <th className="border-2 border-slate-800 p-3 text-lg font-bold w-32">الفصل</th>
                    <th className="border-2 border-slate-800 p-3 text-lg font-bold w-48">التوقيع</th>
                  </tr>
                </thead>
                <tbody>
                  {data.periods.map(period => {
                    const subsInPeriod = groupedSubs[period.id] || [];
                    if (subsInPeriod.length === 0) return null;
                    
                    return subsInPeriod.map((sub, index) => {
                      const originalTeacher = data.teachers.find(t => t.id === sub.originalTeacherId);
                      const substituteTeacher = data.teachers.find(t => t.id === sub.substituteTeacherId);
                      const classroom = data.classrooms.find(c => c.id === sub.classroomId);
                      
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          {index === 0 && (
                            <td 
                              rowSpan={subsInPeriod.length} 
                              className="border-2 border-slate-800 p-3 font-bold text-lg bg-slate-50"
                            >
                              {period.name}
                            </td>
                          )}
                          <td className="border-2 border-slate-800 p-3 text-lg">{originalTeacher?.name}</td>
                          <td className="border-2 border-slate-800 p-3 text-lg font-bold">{substituteTeacher?.name}</td>
                          <td className="border-2 border-slate-800 p-3 text-lg">{classroom?.name}</td>
                          <td className="border-2 border-slate-800 p-3"></td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl">
                <p className="text-xl font-medium mb-2">لا توجد تبديلات لعرضها</p>
                <p>قم بتوليد التبديلات من صفحة "إدارة التبديلات" لتظهر هنا.</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-16 flex justify-between px-12 text-lg font-bold text-slate-800">
              <div className="text-center">
                <p className="mb-8">وكيل الشؤون المدرسية</p>
                <p>.........................................</p>
              </div>
              <div className="text-center">
                <p className="mb-8">مدير المدرسة</p>
                <p>.........................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
