
// @ts-nocheck

const db = new window.Dexie('TeacherMonitorDB');

db.version(2).stores({
  teachers: 'id, name',
  supervisionReports: 'id, teacherName, date',
  bookCheckingReports: 'id, teacherName, date',
  workCoverageReports: 'id, teacherName, date',
  settings: 'key', // Using key as the primary key for a key-value store
});

db.version(1).stores({
  teachers: 'id, name',
  supervisionReports: 'id, teacherName, date',
  bookCheckingReports: 'id, teacherName, date',
  workCoverageReports: 'id, teacherName, date',
});

// This is to help with type inference in components
export const dbTyped = {
    teachers: db.table('teachers'),
    supervisionReports: db.table('supervisionReports'),
    bookCheckingReports: db.table('bookCheckingReports'),
    workCoverageReports: db.table('workCoverageReports'),
    settings: db.table('settings'),
};
