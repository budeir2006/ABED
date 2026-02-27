import { GoogleGenAI, Type } from '@google/genai';
import { ScheduleData } from '../types';

// Initialize the Gemini client
// Note: We use process.env.GEMINI_API_KEY as per the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const parseScheduleWithAI = async (
  fileData: string,
  mimeType: string,
  fileName: string
): Promise<Partial<ScheduleData>> => {
  try {
    const prompt = `
      أنت نظام خبير في تحليل الجداول المدرسية.
      قم بتحليل هذا الجدول المدرسي واستخراج البيانات التالية بدقة:
      1. قائمة المعلمين (الاسم، التخصص إذا وجد).
      2. قائمة الفصول الدراسية.
      3. أوقات الحصص (رقم الحصة، وقت البداية، وقت النهاية).
      4. جدول الحصص (اليوم، الحصة، المعلم، الفصل، المادة).
      
      يجب أن يكون المخرج بصيغة JSON متوافقة مع الهيكل المطلوب.
      تأكد من عدم تكرار أسماء المعلمين أو الفصول.
      إذا لم تكن أوقات الحصص واضحة، افترض أوقاتاً افتراضية (مثلاً 45 دقيقة للحصة تبدأ من 8:00 صباحاً).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: fileData.split(',')[1] || fileData, // Remove data URI scheme if present
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teachers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  maxPeriodsPerDay: { type: Type.NUMBER },
                  maxPeriodsPerWeek: { type: Type.NUMBER },
                },
                required: ['id', 'name', 'subject'],
              },
            },
            classrooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                },
                required: ['id', 'name'],
              },
            },
            periods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  isBreak: { type: Type.BOOLEAN },
                },
                required: ['id', 'name', 'startTime', 'endTime'],
              },
            },
            entries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  day: { type: Type.STRING },
                  periodId: { type: Type.STRING },
                  teacherId: { type: Type.STRING },
                  classroomId: { type: Type.STRING },
                  subject: { type: Type.STRING },
                },
                required: ['id', 'day', 'periodId', 'teacherId', 'classroomId', 'subject'],
              },
            },
          },
          required: ['teachers', 'classrooms', 'periods', 'entries'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error('Error parsing schedule with AI:', error);
    throw new Error('فشل في تحليل الجدول. يرجى التأكد من وضوح الصورة أو الملف.');
  }
};

export const suggestSubstitutionsWithAI = async (
  scheduleData: ScheduleData,
  absentTeacherIds: string[],
  date: string,
  dayOfWeek: string
): Promise<any> => {
  try {
    const prompt = `
      أنت نظام خبير في إدارة التبديلات المدرسية (الاحتياط).
      لدينا غياب للمعلمين التاليين في يوم ${dayOfWeek} الموافق ${date}:
      ${absentTeacherIds.map(id => scheduleData.teachers.find(t => t.id === id)?.name).join(', ')}
      
      البيانات الحالية للجدول:
      ${JSON.stringify({
        teachers: scheduleData.teachers,
        periods: scheduleData.periods,
        entries: scheduleData.entries.filter(e => e.day === dayOfWeek)
      })}
      
      المطلوب:
      اقتراح معلمين بدلاء لتغطية حصص المعلمين الغائبين في هذا اليوم.
      
      قواعد التبديل:
      1. لا يمكن لمعلم أن يدرس حصتين في نفس الوقت (تجنب التعارض).
      2. يفضل اختيار معلم من نفس التخصص إذا أمكن.
      3. يفضل اختيار معلم لديه حصة فراغ في نفس الوقت.
      4. يجب عدم تجاوز الحد الأقصى لحصص المعلم في اليوم (maxPeriodsPerDay).
      
      قم بإرجاع قائمة بالتبديلات المقترحة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              absenceId: { type: Type.STRING },
              periodId: { type: Type.STRING },
              originalTeacherId: { type: Type.STRING },
              substituteTeacherId: { type: Type.STRING },
              classroomId: { type: Type.STRING },
              day: { type: Type.STRING },
            },
            required: ['periodId', 'originalTeacherId', 'substituteTeacherId', 'classroomId', 'day'],
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('Error suggesting substitutions:', error);
    throw new Error('فشل في اقتراح التبديلات.');
  }
};
