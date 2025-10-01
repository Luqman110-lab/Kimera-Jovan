
import React, { useMemo } from 'react';
import { Page, Teacher, SupervisionReport, BookCheckingReport, WorkCoverageReport } from '../types';
import { useLiveQuery } from '../hooks/useLocalStorage';
import { dbTyped } from '../utils/db';
import { ClipboardIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon, CalendarIcon, StarIcon } from './Icons';

interface NavigateToProps {
  page: (page: Page) => void;
  report: (page: Page, reportId: string) => void;
  teacherProfile: (teacherId: string) => void;
}

interface DashboardProps {
  navigateTo: NavigateToProps;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const ReportTypeBadge: React.FC<{ type: 'Supervision' | 'Book Checking' | 'Work Coverage' }> = ({ type }) => {
    const colors = {
        Supervision: 'bg-blue-100 text-blue-800',
        'Book Checking': 'bg-green-100 text-green-800',
        'Work Coverage': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[type]}`}>{type}</span>;
}

export const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
    const teachers = useLiveQuery<Teacher[]>(() => dbTyped.teachers.toArray(), []) ?? [];
    const supervisionReports = useLiveQuery<SupervisionReport[]>(() => dbTyped.supervisionReports.toArray(), []) ?? [];
    const bookCheckingReports = useLiveQuery<BookCheckingReport[]>(() => dbTyped.bookCheckingReports.toArray(), []) ?? [];
    const workCoverageReports = useLiveQuery<WorkCoverageReport[]>(() => dbTyped.workCoverageReports.toArray(), []) ?? [];

    const stats = useMemo(() => {
        const allReports = [...supervisionReports, ...bookCheckingReports, ...workCoverageReports];
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const reportsThisMonth = allReports.filter(r => new Date(r.date) >= firstDayOfMonth).length;

        const totalRating = supervisionReports.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = supervisionReports.length > 0 ? (totalRating / supervisionReports.length).toFixed(1) : 'N/A';

        return {
            totalTeachers: teachers.length,
            totalReports: allReports.length,
            reportsThisMonth,
            averageRating,
        };
    }, [teachers, supervisionReports, bookCheckingReports, workCoverageReports]);

    const recentReports = useMemo(() => {
        const mappedSupervision = supervisionReports.map(r => ({ ...r, type: 'Supervision', page: Page.SUPERVISION }));
        const mappedBookChecking = bookCheckingReports.map(r => ({ ...r, type: 'Book Checking', page: Page.BOOK_CHECKING }));
        const mappedWorkCoverage = workCoverageReports.map(r => ({ ...r, type: 'Work Coverage', page: Page.WORK_COVERAGE }));

        return [...mappedSupervision, ...mappedBookChecking, ...mappedWorkCoverage]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [supervisionReports, bookCheckingReports, workCoverageReports]);
    
    const teachersToReview = useMemo(() => {
        const reportCounts: { [teacherName: string]: number } = {};

        [...supervisionReports, ...bookCheckingReports, ...workCoverageReports].forEach(report => {
            reportCounts[report.teacherName] = (reportCounts[report.teacherName] || 0) + 1;
        });

        return teachers
            .map(teacher => ({
                ...teacher,
                reportCount: reportCounts[teacher.name] || 0,
            }))
            .sort((a, b) => a.reportCount - b.reportCount || a.name.localeCompare(b.name))
            .slice(0, 5);
            
    }, [teachers, supervisionReports, bookCheckingReports, workCoverageReports]);


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Dashboard</h2>
                <p className="mt-1 text-lg text-gray-600">Overview of all monitoring activities.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Total Teachers" value={stats.totalTeachers} icon={<UserGroupIcon className="w-6 h-6" />} />
                <StatCard title="Total Reports" value={stats.totalReports} icon={<ClipboardIcon className="w-6 h-6" />} />
                <StatCard title="Reports This Month" value={stats.reportsThisMonth} icon={<CalendarIcon className="w-6 h-6" />} />
                <StatCard title="Avg. Supervision Rating" value={stats.averageRating} icon={<StarIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="divide-y divide-gray-200">
                        {recentReports.length > 0 ? recentReports.map(report => (
                             <li key={`${report.type}-${report.id}`} className="py-4 flex items-center justify-between hover:bg-gray-50 -mx-6 px-6">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <ReportTypeBadge type={report.type as any} />
                                        <p className="text-sm font-medium text-indigo-600 truncate">{report.teacherName}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {report.subject} &bull; {new Date(report.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => navigateTo.report(report.page, report.id)} className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                                    View
                                </button>
                            </li>
                        )) : (
                            <li className="py-8 text-center text-gray-500">
                                No recent reports to display.
                            </li>
                        )}
                    </ul>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                             <button onClick={() => navigateTo.page(Page.SUPERVISION)} className="w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 transition-colors">
                                <ClipboardIcon className="w-6 h-6 text-indigo-600 mr-4"/>
                                <span className="font-medium text-gray-700">New Supervision Report</span>
                             </button>
                             <button onClick={() => navigateTo.page(Page.BOOK_CHECKING)} className="w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 transition-colors">
                                <BookOpenIcon className="w-6 h-6 text-indigo-600 mr-4"/>
                                <span className="font-medium text-gray-700">New Book Check Report</span>
                             </button>
                              <button onClick={() => navigateTo.page(Page.WORK_COVERAGE)} className="w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 transition-colors">
                                <ChartBarIcon className="w-6 h-6 text-indigo-600 mr-4"/>
                                <span className="font-medium text-gray-700">New Work Coverage Report</span>
                             </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Teachers to Review</h3>
                        <p className="text-sm text-gray-500 mb-4">These teachers have the fewest reports on record.</p>
                         <ul className="divide-y divide-gray-200">
                            {teachersToReview.length > 0 ? teachersToReview.map(teacher => (
                                <li key={teacher.id} className="py-3 flex items-center justify-between">
                                    <button onClick={() => navigateTo.teacherProfile(teacher.id)} className="text-left group">
                                        <p className="font-medium text-gray-800 group-hover:text-indigo-600">{teacher.name}</p>
                                    </button>
                                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{teacher.reportCount} reports</span>
                                </li>
                            )) : (
                                <li className="py-4 text-center text-gray-500 text-sm">
                                    All teachers have reports or no teachers exist.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
