
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SupervisionReport, Teacher, AppSetting } from '../types';
import { dbTyped } from '../utils/db';
import { generatePdfDocument, generateBulkPdfDocument } from '../utils/pdfUtils';
import { FormInput, FormTextarea, FormSelect, ReportHeader, ReportListItem, ReportDetailViewHeader, ReportField, PdfPreviewModal, Fieldset, StarRatingInput, DetailSection, StarRatingDisplay, PdfDocument, PdfSection, PdfField } from './common/ReportComponents';
import { TargetIcon, ThumbsUpIcon, StarIcon, SearchIcon, DocumentDuplicateIcon } from './Icons';
import { useLiveQuery } from '../hooks/useLocalStorage';

const emptyForm: SupervisionReport = {
    id: '', teacherName: '', className: '', subject: '', date: '', rating: 0, lessonObjectives: '', teachingMethods: '', learnerEngagement: '', classroomManagement: '', useOfTeachingAids: '', assessmentAndFeedback: '', strengths: '', weaknesses: '', recommendations: ''
};

const SupervisionForm: React.FC<{
    onSave: (report: SupervisionReport) => void;
    onCancel: () => void;
    initialData?: SupervisionReport;
    teachers: Teacher[];
}> = ({ onSave, onCancel, initialData, teachers }) => {
    const [formData, setFormData] = useState<SupervisionReport>(initialData || emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof SupervisionReport, string>>>({});
    const CHAR_LIMIT = 500;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target as { name: keyof SupervisionReport; value: string };
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleRatingChange = (name: string, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SupervisionReport, string>> = {};
        if (!formData.teacherName.trim()) newErrors.teacherName = "Teacher name is required.";
        if (!formData.className.trim()) newErrors.className = "Class is required.";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
        if (!formData.date) newErrors.date = "Date is required.";
        if (!formData.lessonObjectives.trim()) newErrors.lessonObjectives = "Lesson objectives are required.";
        if (!formData.teachingMethods.trim()) newErrors.teachingMethods = "Teaching methods are required.";
        if (!formData.learnerEngagement.trim()) newErrors.learnerEngagement = "Learner engagement is required.";
        if (!formData.classroomManagement.trim()) newErrors.classroomManagement = "Classroom management is required.";
        if (!formData.useOfTeachingAids.trim()) newErrors.useOfTeachingAids = "Use of teaching aids is required.";
        if (!formData.assessmentAndFeedback.trim()) newErrors.assessmentAndFeedback = "Assessment and feedback are required.";
        if (!formData.strengths.trim()) newErrors.strengths = "Strengths are required.";
        if (!formData.weaknesses.trim()) newErrors.weaknesses = "Areas for improvement are required.";
        if (!formData.recommendations.trim()) newErrors.recommendations = "Recommendations are required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave({ ...formData, id: formData.id || Date.now().toString() });
        } else {
            alert("Please fill out all required fields.");
        }
    };

    const renderError = (field: keyof SupervisionReport) => {
        return errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;
    }

    const renderCharCount = (field: 'strengths' | 'weaknesses' | 'recommendations', limit: number) => {
        const length = formData[field]?.length || 0;
        return <p className={`text-right text-xs mt-1 ${length > limit ? 'text-red-500' : 'text-gray-500'}`}>{length} / {limit}</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">{initialData?.id ? 'Edit' : 'Create'} Supervision Report</h3>
            
            <Fieldset legend="Report Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FormSelect label="Teacher Name" id="teacherName" value={formData.teacherName} onChange={handleChange} required>
                            <option value="">Select a teacher</option>
                            {teachers.sort((a,b) => a.name.localeCompare(b.name)).map(teacher => (
                                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                            ))}
                        </FormSelect>
                        {renderError('teacherName')}
                    </div>
                    <div>
                        <FormInput label="Class" id="className" value={formData.className} onChange={handleChange} placeholder="e.g., Grade 10A" required />
                        {renderError('className')}
                    </div>
                    <div>
                        <FormInput label="Subject" id="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Mathematics" required />
                        {renderError('subject')}
                    </div>
                    <div>
                        <FormInput label="Date" id="date" type="date" value={formData.date} onChange={handleChange} required />
                        {renderError('date')}
                    </div>
                </div>
            </Fieldset>
            
            <Fieldset legend="Lesson Observation">
                <FormTextarea label="Lesson Objectives" id="lessonObjectives" value={formData.lessonObjectives} onChange={handleChange} rows={3} placeholder="Describe the main goals of the lesson." required />
                {renderError('lessonObjectives')}
                <FormTextarea label="Teaching Methods" id="teachingMethods" value={formData.teachingMethods} onChange={handleChange} rows={3} placeholder="e.g., Lecture, group work, demonstration, etc." required />
                {renderError('teachingMethods')}
                <FormTextarea label="Learner Engagement" id="learnerEngagement" value={formData.learnerEngagement} onChange={handleChange} rows={3} placeholder="How were the students involved in the lesson?" required />
                {renderError('learnerEngagement')}
                <FormTextarea label="Classroom Management" id="classroomManagement" value={formData.classroomManagement} onChange={handleChange} rows={3} placeholder="Describe the classroom atmosphere, student behavior, and transitions." required />
                {renderError('classroomManagement')}
                <FormTextarea label="Use of Teaching Aids" id="useOfTeachingAids" value={formData.useOfTeachingAids} onChange={handleChange} rows={3} placeholder="List the teaching materials used (e.g., whiteboard, projector, charts) and their effectiveness." required />
                {renderError('useOfTeachingAids')}
                <FormTextarea label="Assessment & Feedback" id="assessmentAndFeedback" value={formData.assessmentAndFeedback} onChange={handleChange} rows={3} placeholder="How did the teacher check for understanding and provide feedback? (e.g., questioning, quizzes, verbal praise)." required />
                {renderError('assessmentAndFeedback')}
            </Fieldset>
            
            <Fieldset legend="Evaluation">
                <StarRatingInput label="Overall Performance Rating" id="rating" value={formData.rating} onChange={handleRatingChange} />
                <div>
                    <FormTextarea label="Strengths" id="strengths" value={formData.strengths} onChange={handleChange} rows={4} placeholder="What went well during the lesson?" required />
                    {renderError('strengths')}
                    {renderCharCount('strengths', CHAR_LIMIT)}
                </div>
                <div>
                    <FormTextarea label="Areas for Improvement" id="weaknesses" value={formData.weaknesses} onChange={handleChange} rows={4} placeholder="What could be improved?" required />
                    {renderError('weaknesses')}
                    {renderCharCount('weaknesses', CHAR_LIMIT)}
                </div>
                <div>
                    <FormTextarea label="Recommendations" id="recommendations" value={formData.recommendations} onChange={handleChange} rows={4} placeholder="Actionable steps for the teacher to take." required />
                    {renderError('recommendations')}
                    {renderCharCount('recommendations', CHAR_LIMIT)}
                </div>
            </Fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Report</button>
            </div>
        </form>
    );
};

const SupervisionPdfContent: React.FC<{ report: SupervisionReport }> = ({ report }) => (
    <>
        <PdfSection title="Summary">
            <PdfField label="Teacher Name">{report.teacherName}</PdfField>
            <PdfField label="Class Name">{report.className}</PdfField>
            <PdfField label="Subject">{report.subject}</PdfField>
            <PdfField label="Date">{new Date(report.date).toLocaleDateString()}</PdfField>
        </PdfSection>
        <PdfSection title="Overall Rating">
            <PdfField label="Performance Rating">
                <StarRatingDisplay rating={report.rating} />
            </PdfField>
        </PdfSection>
        <PdfSection title="Lesson Observation">
            <PdfField label="Lesson Objectives" fullWidth>{report.lessonObjectives}</PdfField>
            <PdfField label="Teaching Methods" fullWidth>{report.teachingMethods}</PdfField>
            <PdfField label="Learner Engagement" fullWidth>{report.learnerEngagement}</PdfField>
            <PdfField label="Classroom Management" fullWidth>{report.classroomManagement}</PdfField>
            <PdfField label="Use of Teaching Aids" fullWidth>{report.useOfTeachingAids}</PdfField>
            <PdfField label="Assessment & Feedback" fullWidth>{report.assessmentAndFeedback}</PdfField>
        </PdfSection>
         <PdfSection title="Evaluation">
            <PdfField label="Strengths" fullWidth>{report.strengths}</PdfField>
            <PdfField label="Areas for Improvement" fullWidth>{report.weaknesses}</PdfField>
            <PdfField label="Recommendations" fullWidth>{report.recommendations}</PdfField>
        </PdfSection>
    </>
);

const SupervisionDetailView: React.FC<{ report: SupervisionReport; onBack: () => void; }> = ({ report, onBack }) => {
    const settings = useLiveQuery<AppSetting[]>(() => dbTyped.settings.toArray(), []) ?? [];
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any | null>(null);
    const pdfElementId = `supervision-report-pdf-${report.id}`;

    const appSettings = useMemo(() => {
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: any });
    }, [settings]);

    const handlePreview = async () => {
        const doc = await generatePdfDocument(pdfElementId);
        if (doc) {
            setPdfDoc(doc);
            setPreviewOpen(true);
        } else {
            alert('Could not generate PDF preview.');
        }
    };
    
    const handleDownload = () => {
        if(pdfDoc) {
            pdfDoc.save(`Supervision_Report_${report.teacherName.replace(/\s/g, '_')}_${report.date}.pdf`);
            setPreviewOpen(false);
            setPdfDoc(null);
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPdfDoc(null);
    };

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <ReportDetailViewHeader title="Supervision Report" onBack={onBack} onExport={handlePreview} />
                <div className="p-4 sm:p-8">
                    <header className="text-center mb-10 border-b pb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Classroom Supervision Report</h1>
                        <p className="text-md text-gray-500 mt-2">{appSettings.schoolName || 'Teacher Monitoring App'}</p>
                    </header>
                    
                    <section className="mb-8 p-6 border rounded-lg bg-gray-50/50">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 text-md">
                            <ReportField label="Teacher Name" value={report.teacherName} />
                            <ReportField label="Class" value={report.className} />
                            <ReportField label="Subject" value={report.subject} />
                            <ReportField label="Date" value={new Date(report.date).toLocaleDateString()} />
                        </div>
                    </section>
                    
                    <div className="space-y-8">
                        <DetailSection title="Overall Rating" icon={<StarIcon className="w-7 h-7" />}>
                                <StarRatingDisplay rating={report.rating} />
                        </DetailSection>

                        <DetailSection title="Lesson Observation" icon={<TargetIcon className="w-7 h-7" />}>
                            <ReportField label="Lesson Objectives" value={report.lessonObjectives} />
                            <hr/>
                            <ReportField label="Teaching Methods" value={report.teachingMethods} />
                            <hr/>
                            <ReportField label="Learner Engagement" value={report.learnerEngagement} />
                            <hr/>
                            <ReportField label="Classroom Management" value={report.classroomManagement} />
                            <hr/>
                            <ReportField label="Use of Teaching Aids" value={report.useOfTeachingAids} />
                            <hr/>
                            <ReportField label="Assessment & Feedback" value={report.assessmentAndFeedback} />
                        </DetailSection>

                        <DetailSection title="Evaluation" icon={<ThumbsUpIcon className="w-7 h-7" />}>
                                <ReportField label="Strengths" value={report.strengths} />
                                <hr/>
                                <ReportField label="Areas for Improvement" value={report.weaknesses} />
                                <hr/>
                                <ReportField label="Recommendations" value={report.recommendations} />
                        </DetailSection>
                    </div>
                </div>
            </div>

            <PdfDocument 
                id={pdfElementId} 
                title="Classroom Supervision Report"
                schoolName={appSettings.schoolName}
                schoolLogo={appSettings.schoolLogo}
                footerText={appSettings.reportFooter}
            >
                <SupervisionPdfContent report={report} />
            </PdfDocument>

            <PdfPreviewModal
                isOpen={isPreviewOpen}
                pdfUrl={pdfDoc ? pdfDoc.output('datauristring') : null}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                title="Supervision Report Preview"
            />
        </>
    );
};

export const SupervisionModule: React.FC<{ initialReportIdToShow?: string; onClearActiveReport: () => void; }> = ({ initialReportIdToShow, onClearActiveReport }) => {
    const reports = useLiveQuery<SupervisionReport[]>(() => dbTyped.supervisionReports.toArray(), []) ?? [];
    const teachers = useLiveQuery<Teacher[]>(() => dbTyped.teachers.toArray(), []) ?? [];
    const settings = useLiveQuery<AppSetting[]>(() => dbTyped.settings.toArray(), []) ?? [];
    const [view, setView] = useState<'LIST' | 'FORM' | 'DETAIL'>('LIST');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isBulkExporting, setIsBulkExporting] = useState(false);

    const appSettings = useMemo(() => {
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: any });
    }, [settings]);

    useEffect(() => {
        if (initialReportIdToShow) {
            setSelectedReportId(initialReportIdToShow);
            setView('DETAIL');
        }
    }, [initialReportIdToShow]);

    const handleSave = useCallback(async (report: SupervisionReport) => {
        await dbTyped.supervisionReports.put(report);
        setView('LIST');
        setSelectedReportId(null);
    }, []);
    
    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            await dbTyped.supervisionReports.delete(id);
        }
    }, []);

    const handleBackToList = () => {
        setView('LIST');
        setSelectedReportId(null);
        if (initialReportIdToShow) {
            onClearActiveReport();
        }
    };

    const filteredAndSortedReports = useMemo(() => {
        let filtered = reports;

        if (searchQuery) {
            filtered = filtered.filter(report => 
                report.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.subject.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterStartDate) {
            const startDate = new Date(filterStartDate + 'T00:00:00');
            filtered = filtered.filter(report => new Date(report.date + 'T00:00:00') >= startDate);
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate + 'T00:00:00');
            filtered = filtered.filter(report => new Date(report.date + 'T00:00:00') <= endDate);
        }

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'teacher-asc':
                    return a.teacherName.localeCompare(b.teacherName);
                case 'date-desc':
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
    }, [reports, searchQuery, filterStartDate, filterEndDate, sortBy]);
    
    const handleBulkExport = useCallback(() => {
        if (filteredAndSortedReports.length === 0) {
            alert('No reports to export.');
            return;
        }
        setIsBulkExporting(true);
    }, [filteredAndSortedReports]);

    useEffect(() => {
        if (!isBulkExporting) return;

        const performExport = async () => {
            const elementIds = filteredAndSortedReports.map(r => `bulk-pdf-supervision-${r.id}`);
            const pdf = await generateBulkPdfDocument(elementIds);
            if (pdf) {
                pdf.save(`Supervision_Reports_Bulk_Export_${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                alert('Failed to generate bulk PDF.');
            }
            setIsBulkExporting(false);
        };
        // Timeout to allow React to render the off-screen elements
        setTimeout(performExport, 100);

    }, [isBulkExporting, filteredAndSortedReports]);

    const selectedReport = reports.find(r => r.id === selectedReportId);

    if (view === 'FORM') {
        return <SupervisionForm onSave={handleSave} onCancel={handleBackToList} initialData={selectedReport} teachers={teachers} />;
    }
    
    if (view === 'DETAIL' && selectedReport) {
        return <SupervisionDetailView report={selectedReport} onBack={handleBackToList} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <ReportHeader title="Supervision Reports" onAddNew={() => { setSelectedReportId(null); setView('FORM'); }} />
                 <button
                    onClick={handleBulkExport}
                    disabled={isBulkExporting || filteredAndSortedReports.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                    {isBulkExporting ? 'Exporting...' : `Export All (${filteredAndSortedReports.length})`}
                </button>
            </div>


            <div className="mb-6">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search by teacher or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border rounded-lg">
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="date-desc">Date (Newest First)</option>
                        <option value="date-asc">Date (Oldest First)</option>
                        <option value="teacher-asc">Teacher Name (A-Z)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        id="startDate"
                        value={filterStartDate}
                        onChange={e => setFilterStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        id="endDate"
                        value={filterEndDate}
                        onChange={e => setFilterEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredAndSortedReports.length > 0 ? (
                    filteredAndSortedReports.map(report => (
                        <ReportListItem key={report.id} report={report} onSelect={(id) => { setSelectedReportId(id); setView('DETAIL'); }} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium">
                            {searchQuery || filterStartDate || filterEndDate ? 'No Reports Found' : 'No Supervision Reports Yet'}
                        </h3>
                        <p className="mt-1 text-sm">
                           {searchQuery || filterStartDate || filterEndDate ? 'No reports match your search and filter criteria.' : 'Click "Add New Report" to get started.'}
                        </p>
                    </div>
                )}
            </div>

            {isBulkExporting && (
                <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '794px', height: 'auto', overflow: 'hidden' }}>
                    {filteredAndSortedReports.map(report => (
                        <PdfDocument
                            key={report.id}
                            id={`bulk-pdf-supervision-${report.id}`}
                            title="Classroom Supervision Report"
                            schoolName={appSettings.schoolName}
                            schoolLogo={appSettings.schoolLogo}
                            footerText={appSettings.reportFooter}
                        >
                            <SupervisionPdfContent report={report} />
                        </PdfDocument>
                    ))}
                </div>
            )}
        </div>
    );
};
