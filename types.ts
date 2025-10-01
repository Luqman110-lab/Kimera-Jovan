
export enum Page {
  DASHBOARD = 'DASHBOARD',
  TEACHERS = 'TEACHERS',
  TEACHER_PROFILE = 'TEACHER_PROFILE',
  SUPERVISION = 'SUPERVISION',
  BOOK_CHECKING = 'BOOK_CHECKING',
  WORK_COVERAGE = 'WORK_COVERAGE',
  SETTINGS = 'SETTINGS',
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  classes: string[];
}

export interface SupervisionReport {
  id: string;
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  rating: number;
  lessonObjectives: string;
  teachingMethods: string;
  learnerEngagement: string;
  classroomManagement: string;
  useOfTeachingAids: string;
  assessmentAndFeedback: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
}

export interface BookCheckingReport {
  id:string;
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  booksChecked: string;
  workCoverage: 'complete' | 'partial' | 'missing';
  // Ratings
  markingRegularity: number;
  feedbackQuality: number;
  learnerNeatness: number;
  // New detailed fields
  exemplaryWorkNoted: string;
  commonStudentErrors: string;
  teacherResponseToFeedback: string;
  // General comments
  comments: string;
}

export interface WorkCoverageReport {
  id: string;
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  plannedTopics: string;
  completedTopics: string;
  pendingTopics: string;
  remarks: string;
  teacherSignature: string;
  supervisorSignature: string;
}

export type Report = SupervisionReport | BookCheckingReport | WorkCoverageReport;

export interface AppSetting {
    key: string;
    value: any;
}
