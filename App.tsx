
import React, { useState } from 'react';
import { Page } from './types';
import { Dashboard } from './components/Dashboard';
import { SupervisionModule } from './components/SupervisionModule';
import { BookCheckingModule } from './components/BookCheckingModule';
import { WorkCoverageModule } from './components/WorkCoverageModule';
import { Header } from './components/Header';
import { TeacherManagementModule } from './components/TeacherManagementModule';
import { TeacherProfilePage } from './components/TeacherProfilePage';
import { SettingsModule } from './components/SettingsModule';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.DASHBOARD);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<{ page: Page; id: string } | null>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<string | null>(null);

  const navigateTo = {
    page: (targetPage: Page) => {
      setPage(targetPage);
      setActiveTeacherId(null);
      setActiveReport(null);
      setTeacherToEdit(null);
    },
    teacherProfile: (teacherId: string) => {
      setActiveTeacherId(teacherId);
      setPage(Page.TEACHER_PROFILE);
    },
    report: (targetPage: Page, reportId: string) => {
      setActiveReport({ page: targetPage, id: reportId });
      setPage(targetPage);
    },
    editTeacher: (teacherId: string) => {
      setTeacherToEdit(teacherId);
      setPage(Page.TEACHERS);
    }
  };

  const clearActiveReport = () => setActiveReport(null);

  const renderPage = () => {
    switch (page) {
      case Page.TEACHERS:
        return <TeacherManagementModule onViewProfile={navigateTo.teacherProfile} initialTeacherToEditId={teacherToEdit} onClearTeacherToEdit={() => setTeacherToEdit(null)} />;
      case Page.TEACHER_PROFILE:
        return activeTeacherId ? <TeacherProfilePage teacherId={activeTeacherId} onViewReport={navigateTo.report} onNavigate={navigateTo.page} onEditTeacher={navigateTo.editTeacher} /> : <Dashboard navigateTo={navigateTo} />;
      case Page.SUPERVISION:
        return <SupervisionModule initialReportIdToShow={activeReport?.page === Page.SUPERVISION ? activeReport.id : undefined} onClearActiveReport={clearActiveReport} />;
      case Page.BOOK_CHECKING:
        return <BookCheckingModule initialReportIdToShow={activeReport?.page === Page.BOOK_CHECKING ? activeReport.id : undefined} onClearActiveReport={clearActiveReport} />;
      case Page.WORK_COVERAGE:
        return <WorkCoverageModule initialReportIdToShow={activeReport?.page === Page.WORK_COVERAGE ? activeReport.id : undefined} onClearActiveReport={clearActiveReport} />;
      case Page.SETTINGS:
        return <SettingsModule />;
      case Page.DASHBOARD:
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header setPage={navigateTo.page} currentPage={page}/>
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Teacher Monitoring App. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
