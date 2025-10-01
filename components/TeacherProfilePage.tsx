import React, { useMemo } from 'react';
import { Page, Teacher, SupervisionReport, BookCheckingReport, WorkCoverageReport } from '../types';
import { dbTyped } from '../utils/db';
import { ChevronLeftIcon, UserCircleIcon, ClipboardIcon, BookOpenIcon, ChartBarIcon, PencilIcon } from './Icons';
import { useLiveQuery } from '../hooks/useLocalStorage';

interface TeacherProfilePageProps {
    teacherId: string;
    onViewReport: (page: Page, reportId: string) => void;
    onNavigate: (page: Page) => void;
    onEditTeacher: (teacherId: string) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
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

export const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ teacherId, onViewReport, onNavigate, onEditTeacher }) => {
    const teachers = useLiveQuery<Teacher[]>(() => dbTyped.teachers.toArray(), []) ?? [];
    const supervisionReports = useLiveQuery<SupervisionReport[]>(() => dbTyped.supervisionReports.toArray(), []) ?? [];
    const bookCheckingReports = useLiveQuery<BookCheckingReport[]>(() => dbTyped.bookCheckingReports.toArray(), []) ?? [];
    const workCoverageReports = useLiveQuery<WorkCoverageReport[]>(() => dbTyped.workCoverageReports.toArray(), []) ?? [];

    const teacher = useMemo(() => teachers.find(t => t.id === teacherId), [teachers, teacherId]);

    const allReports = useMemo(() => {
        if (!teacher) return [];
        const mappedSupervision = supervisionReports.filter(r => r.teacherName === teacher.name).map(r => ({ ...r, type: 'Supervision', page: Page.SUPERVISION }));
        const mappedBookChecking = bookCheckingReports.filter(r => r.teacherName === teacher.name).map(r => ({ ...r, type: 'Book Checking', page: Page.BOOK_CHECKING }));
        const mappedWorkCoverage = workCoverageReports.filter(r => r.teacherName === teacher.name).map(r => ({ ...r, type: 'Work Coverage', page: Page.WORK_COVERAGE }));

        return [...mappedSupervision, ...mappedBookChecking, ...mappedWorkCoverage]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [teacher, supervisionReports, bookCheckingReports, workCoverageReports]);


    if (!teacher) {
        return (
            <div className="text-center text-gray-500 py-12">
                <h2 className="text-2xl font-bold">Teacher not found.</h2>
                <button onClick={() => onNavigate(Page.TEACHERS)} className="mt-4 text-indigo-600 hover:underline">
                    Return to Teachers List
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => onNavigate(Page.TEACHERS)} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to Teachers List
                </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6">
                    <UserCircleIcon className="w-24 h-24 text-gray-400 mb-4 sm:mb-0" />
                    <div className="text-center sm:text-left flex-grow">
                        <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                        <p className="text-md text-gray-600 mt-1">
                            <span className="font-semibold">Subjects:</span> {teacher.subjects.join(', ') || 'N/A'}
                        </p>
                        <p className="text-md text-gray-600">
                            <span className="font-semibold">Classes:</span> {teacher.classes.join(', ') || 'N/A'}
                        </p>
                    </div>
                    <button 
                        onClick={() => onEditTeacher(teacher.id)} 
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Teacher
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Supervision Reports" value={supervisionReports.filter(r => r.teacherName === teacher.name).length} icon={<ClipboardIcon className="w-6 h-6" />} />
                <StatCard title="Book Checking Reports" value={bookCheckingReports.filter(r => r.teacherName === teacher.name).length} icon={<BookOpenIcon className="w-6 h-6" />} />
                <StatCard title="Work Coverage Reports" value={workCoverageReports.filter(r => r.teacherName === teacher.name).length} icon={<ChartBarIcon className="w-6 h-6" />} />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg shadow-sm">
                    <ul className="divide-y divide-gray-200">
                        {allReports.length > 0 ? allReports.map(report => (
                            <li key={`${report.type}-${report.id}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <ReportTypeBadge type={report.type as any} />
                                        <p className="text-sm font-medium text-indigo-600 truncate">{report.subject}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Class: {report.className} &bull; Date: {new Date(report.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => onViewReport(report.page, report.id)} className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                                    View
                                </button>
                            </li>
                        )) : (
                            <li className="px-6 py-8 text-center text-gray-500">
                                No reports found for this teacher.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};
