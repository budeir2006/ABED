import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScheduleData, Teacher, Classroom, Period, ScheduleEntry, Absence, Substitution, SchoolInfo } from '../types';

interface ScheduleContextType {
  data: ScheduleData;
  setData: React.Dispatch<React.SetStateAction<ScheduleData>>;
  updateSchoolInfo: (info: Partial<SchoolInfo>) => void;
  addAbsence: (absence: Absence) => void;
  removeAbsence: (id: string) => void;
  setSubstitutions: (subs: Substitution[]) => void;
  clearSubstitutions: () => void;
}

const defaultData: ScheduleData = {
  teachers: [
    { id: 't1', name: 'أحمد محمد', subject: 'رياضيات', maxPeriodsPerDay: 4, maxPeriodsPerWeek: 18 },
    { id: 't2', name: 'خالد عبدالله', subject: 'لغة عربية', maxPeriodsPerDay: 4, maxPeriodsPerWeek: 18 },
    { id: 't3', name: 'سعيد علي', subject: 'علوم', maxPeriodsPerDay: 4, maxPeriodsPerWeek: 18 },
    { id: 't4', name: 'عمر حسن', subject: 'لغة إنجليزية', maxPeriodsPerDay: 4, maxPeriodsPerWeek: 18 },
  ],
  classrooms: [
    { id: 'c1', name: 'الأول أ' },
    { id: 'c2', name: 'الأول ب' },
    { id: 'c3', name: 'الثاني أ' },
  ],
  periods: [
    { id: 'p1', name: 'الحصة الأولى', startTime: '08:00', endTime: '08:45', isBreak: false },
    { id: 'p2', name: 'الحصة الثانية', startTime: '08:45', endTime: '09:30', isBreak: false },
    { id: 'p3', name: 'الاستراحة', startTime: '09:30', endTime: '10:00', isBreak: true },
    { id: 'p4', name: 'الحصة الثالثة', startTime: '10:00', endTime: '10:45', isBreak: false },
  ],
  entries: [
    { id: 'e1', day: 'الأحد', periodId: 'p1', teacherId: 't1', classroomId: 'c1', subject: 'رياضيات' },
    { id: 'e2', day: 'الأحد', periodId: 'p2', teacherId: 't2', classroomId: 'c1', subject: 'لغة عربية' },
    { id: 'e3', day: 'الأحد', periodId: 'p4', teacherId: 't3', classroomId: 'c2', subject: 'علوم' },
  ],
  absences: [],
  substitutions: [],
  schoolInfo: { name: 'مدرسة المستقبل الأهلية' },
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ScheduleData>(defaultData);

  const updateSchoolInfo = (info: Partial<SchoolInfo>) => {
    setData((prev) => ({ ...prev, schoolInfo: { ...prev.schoolInfo, ...info } }));
  };

  const addAbsence = (absence: Absence) => {
    setData((prev) => ({ ...prev, absences: [...prev.absences, absence] }));
  };

  const removeAbsence = (id: string) => {
    setData((prev) => ({
      ...prev,
      absences: prev.absences.filter((a) => a.id !== id),
      substitutions: prev.substitutions.filter((s) => s.absenceId !== id),
    }));
  };

  const setSubstitutions = (subs: Substitution[]) => {
    setData((prev) => ({ ...prev, substitutions: subs }));
  };

  const clearSubstitutions = () => {
    setData((prev) => ({ ...prev, substitutions: [] }));
  };

  return (
    <ScheduleContext.Provider
      value={{
        data,
        setData,
        updateSchoolInfo,
        addAbsence,
        removeAbsence,
        setSubstitutions,
        clearSubstitutions,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
