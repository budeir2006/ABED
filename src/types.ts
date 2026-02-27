export interface Teacher {
  id: string;
  name: string;
  subject: string;
  maxPeriodsPerDay: number;
  maxPeriodsPerWeek: number;
}

export interface Classroom {
  id: string;
  name: string;
}

export interface Period {
  id: string;
  name: string; // e.g., "الحصة الأولى"
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  isBreak?: boolean;
}

export interface ScheduleEntry {
  id: string;
  day: string; // "الأحد", "الإثنين", etc.
  periodId: string;
  teacherId: string;
  classroomId: string;
  subject: string;
}

export interface Absence {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
}

export interface Substitution {
  id: string;
  absenceId: string;
  periodId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  classroomId: string;
  day: string;
}

export interface SchoolInfo {
  name: string;
  logoUrl?: string;
}

export interface ScheduleData {
  teachers: Teacher[];
  classrooms: Classroom[];
  periods: Period[];
  entries: ScheduleEntry[];
  absences: Absence[];
  substitutions: Substitution[];
  schoolInfo: SchoolInfo;
}
