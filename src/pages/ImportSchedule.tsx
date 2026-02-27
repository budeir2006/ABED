import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSchedule } from '../store/ScheduleContext';
import { parseScheduleWithAI } from '../services/aiService';
import * as XLSX from 'xlsx';

export const ImportSchedule: React.FC = () => {
  const { setData } = useSchedule();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result;
        if (!result) throw new Error('فشل في قراءة الملف');

        let parsedData;

        if (file.type.includes('image') || file.type.includes('pdf')) {
          // Send to Gemini for OCR and parsing
          const base64Data = result as string;
          parsedData = await parseScheduleWithAI(base64Data, file.type, file.name);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          parsedData = await parseScheduleWithAI(
            `data:text/plain;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(json))))}`,
            'text/plain',
            file.name
          );
        } else if (file.name.endsWith('.roz')) {
          const textDecoder = new TextDecoder('utf-8');
          const textData = textDecoder.decode(result as ArrayBuffer);
          parsedData = await parseScheduleWithAI(
            `data:text/plain;base64,${btoa(unescape(encodeURIComponent(textData)))}`,
            'text/plain',
            file.name
          );
        } else {
          throw new Error('صيغة الملف غير مدعومة');
        }

        if (parsedData && parsedData.teachers && parsedData.periods) {
          setData((prev) => ({
            ...prev,
            teachers: parsedData.teachers || [],
            classrooms: parsedData.classrooms || [],
            periods: parsedData.periods || [],
            entries: parsedData.entries || [],
          }));
          setSuccess(true);
        } else {
          throw new Error('لم يتم العثور على بيانات جدول صحيحة في الملف');
        }
      };

      if (file.type.includes('image') || file.type.includes('pdf')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop as any,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/octet-stream': ['.roz'],
      'text/xml': ['.roz'],
    },
    multiple: false,
  } as any);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">استيراد الجدول المدرسي</h1>
        <p className="text-slate-500">قم برفع صورة الجدول، ملف Excel، أو ملف aSc TimeTables (.roz) ليقوم النظام بتحليله واستخراج البيانات تلقائياً.</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-slate-700">جاري تحليل الجدول باستخدام الذكاء الاصطناعي...</p>
            <p className="text-sm text-slate-500">قد تستغرق هذه العملية بضع ثوانٍ</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full mb-2">
              <Upload size={32} />
            </div>
            <p className="text-xl font-medium text-slate-700">اسحب وأفلت الملف هنا، أو انقر للاختيار</p>
            <p className="text-sm text-slate-500">يدعم الصور (JPG, PNG)، ملفات Excel، Word، وملفات aSc (.roz)</p>
            
            <div className="flex gap-4 mt-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <FileImage size={16} className="text-blue-500" /> صور
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <FileSpreadsheet size={16} className="text-emerald-500" /> Excel
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <FileText size={16} className="text-indigo-500" /> Word
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <FileText size={16} className="text-rose-500" /> ROZ
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold">خطأ في الاستيراد</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700">
          <CheckCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold">تم الاستيراد بنجاح!</h4>
            <p className="text-sm mt-1">تم تحليل الجدول واستخراج بيانات المعلمين والحصص بنجاح. يمكنك الآن الانتقال لإدارة التبديلات.</p>
          </div>
        </div>
      )}
    </div>
  );
};
