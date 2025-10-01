
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BookCheckingReport, Teacher, AppSetting } from '../types';
import { dbTyped } from '../utils/db';
import { generatePdfDocument, generateBulkPdfDocument } from '../utils/pdfUtils';
import { FormInput, FormTextarea, FormSelect, ReportHeader, ReportListItem, ReportDetailViewHeader, ReportField, PdfPreviewModal, Fieldset, StarRatingInput, DetailSection, StarRatingDisplay, PdfDocument, PdfSection, PdfField } from './common/ReportComponents';
import { SearchIcon, StarIcon, BookOpenIcon, DocumentDuplicateIcon } from './Icons';
import { useLiveQuery } from '../hooks/useLocalStorage';

const emptyForm: BookCheckingReport = {
    id: '', teacherName: '', className: '', subject: '', date: '', booksChecked: '', workCoverage: 'complete',
    markingRegularity: 0, feedbackQuality: 0, learnerNeatness: 0,
    exemplaryWorkNoted: '', commonStudentErrors: '', teacherResponseToFeedback: '', comments: ''
};


const BookCheckingForm: React.FC<{
    onSave: (report: BookCheckingReport) => void;
    onCancel: () => void;
    initialData?: BookCheckingReport;
    teachers: Teacher[];
}> = ({ onSave, onCancel, initialData, teachers }) => {
    const [formData, setFormData] = useState<BookCheckingReport>(initialData || emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof BookCheckingReport, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target as { name: keyof BookCheckingReport; value: string };
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleRatingChange = (name: string, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof BookCheckingReport, string>> = {};
        if (!formData.teacherName.trim()) newErrors.teacherName = "Teacher name is required.";
        if (!formData.className.trim()) newErrors.className = "Class is required.";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
        if (!formData.date) newErrors.date = "Date is required.";
        if (!formData.booksChecked.trim() || parseInt(formData.booksChecked) <= 0) newErrors.booksChecked = "Please enter a valid number of books.";
        if (formData.markingRegularity === 0) newErrors.markingRegularity = "Rating is required.";
        if (formData.feedbackQuality === 0) newErrors.feedbackQuality = "Rating is required.";
        if (formData.learnerNeatness === 0) newErrors.learnerNeatness = "Rating is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave({ ...formData, id: formData.id || Date.now().toString() });
        } else {
             alert("Please fill out all required fields and provide ratings.");
        }
    };
    
    const renderError = (field: keyof BookCheckingReport) => {
        return errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">{initialData ? 'Edit' : 'Create'} Book Checking Report</h3>
            
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
                        <FormInput label="Class" id="className" value={formData.className} onChange={handleChange} required />
                        {renderError('className')}
                    </div>
                    <div>
                        <FormInput label="Subject" id="subject" value={formData.subject} onChange={handleChange} required />
                        {renderError('subject')}
                    </div>
                    <div>
                        <FormInput label="Date" id="date" type="date" value={formData.date} onChange={handleChange} required />
                        {renderError('date')}
                    </div>
                     <div>
                        <FormInput label="Number of Books Checked" id="booksChecked" type="number" value={formData.booksChecked} onChange={handleChange} required />
                         {renderError('booksChecked')}
                    </div>
                    <div>
                        <FormSelect label="Coverage of Work" id="workCoverage" value={formData.workCoverage} onChange={handleChange} required>
                            <option value="complete">Complete</option>
                            <option value="partial">Partial</option>
                            <option value="missing">Missing</option>
                        </FormSelect>
                    </div>
                </div>
            </Fieldset>

            <Fieldset legend="Evaluation Criteria">
                <StarRatingInput label="Marking Regularity" id="markingRegularity" value={formData.markingRegularity} onChange={handleRatingChange} />
                {renderError('markingRegularity')}
                <StarRatingInput label="Feedback Quality" id="feedbackQuality" value={formData.feedbackQuality} onChange={handleRatingChange} />
                {renderError('feedbackQuality')}
                <StarRatingInput label="Learner Neatness / Handwriting" id="learnerNeatness" value={formData.learnerNeatness} onChange={handleRatingChange} />
                {renderError('learnerNeatness')}
            </Fieldset>

            <Fieldset legend="Observations & Follow-up">
                <FormTextarea label="Exemplary Work Noted" id="exemplaryWorkNoted" value={formData.exemplaryWorkNoted} onChange={handleChange} rows={3} placeholder="Highlight any outstanding student work or practices." />
                <FormTextarea label="Common Student Errors" id="commonStudentErrors" value={formData.commonStudentErrors} onChange={handleChange} rows={3} placeholder="Note any recurring mistakes or areas of difficulty for students." />
                <FormTextarea label="Teacher's Response to Previous Feedback" id="teacherResponseToFeedback" value={formData.teacherResponseToFeedback} onChange={handleChange} rows={3} placeholder="Describe if and how the teacher has acted upon feedback from prior book checks." />
                <FormTextarea label="General Comments & Recommendations" id="comments" value={formData.comments} onChange={handleChange} rows={4} placeholder="Provide overall comments and actionable recommendations." />
            </Fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Report</button>
            </div>
        </form>
    );
};

const BookCheckingPdfContent: React.FC<{ report: BookCheckingReport }> = ({ report }) => (
    <>
        <PdfSection title="Summary">
            <PdfField label="Teacher Name">{report.teacherName}</PdfField>
            <PdfField label="Class Name">{report.className}</PdfField>
            <PdfField label="Subject">{report.subject}</PdfField>
            <PdfField label="Date">{new Date(report.date).toLocaleDateString()}</PdfField>
            <PdfField label="# Books Checked">{report.booksChecked}</PdfField>
            <PdfField label="Work Coverage">{report.workCoverage.charAt(0).toUpperCase() + report.workCoverage.slice(1)}</PdfField>
        </PdfSection>
        <PdfSection title="Evaluation Criteria">
            <PdfField label="Marking Regularity"><StarRatingDisplay rating={report.markingRegularity} /></PdfField>
            <PdfField label="Feedback Quality"><StarRatingDisplay rating={report.feedbackQuality} /></PdfField>
            <PdfField label="Learner Neatness"><StarRatingDisplay rating={report.learnerNeatness} /></PdfField>
        </PdfSection>
        <PdfSection title="Observations & Follow-up">
            <PdfField label="Exemplary Work Noted" fullWidth>{report.exemplaryWorkNoted}</PdfField>
            <PdfField label="Common Student Errors" fullWidth>{report.commonStudentErrors}</PdfField>
            <PdfField label="Teacher's Response to Previous Feedback" fullWidth>{report.teacherResponseToFeedback}</PdfField>
            <PdfField label="General Comments & Recommendations" fullWidth>{report.comments}</PdfField>
        </PdfSection>
    </>
);

const BookCheckingDetailView: React.FC<{ report: BookCheckingReport; onBack: () => void; }> = ({ report, onBack }) => {
    const settings = useLiveQuery<AppSetting[]>(() => dbTyped.settings.toArray(), []) ?? [];
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any | null>(null);
    const pdfElementId = `book-checking-report-pdf-${report.id}`;

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
            pdfDoc.save(`Book_Checking_${report.teacherName.replace(/\s/g, '_')}_${report.date}.pdf`);
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
                 <ReportDetailViewHeader title="Book Checking Report" onBack={onBack} onExport={handlePreview} />
                <div className="p-4 sm:p-8">
                     <header className="text-center mb-10 border-b pb-6">
                         <h1 className="text-3xl font-bold text-gray-900">Book Checking Report</h1>
                         <p className="text-md text-gray-500 mt-2">{appSettings.schoolName || 'Teacher Monitoring App'}</p>
                     </header>
                    
                     <section className="mb-8 p-6 border rounded-lg bg-gray-50/50">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 text-md">
                                <ReportField label="Teacher Name" value={report.teacherName} />
                                <ReportField label="Class" value={report.className} />
                                <ReportField label="Subject" value={report.subject} />
                                <ReportField label="Date" value={new Date(report.date).toLocaleDateString()} />
                                <ReportField label="# Books Checked" value={report.booksChecked} />
                                <ReportField label="Work Coverage" value={report.workCoverage.charAt(0).toUpperCase() + report.workCoverage.slice(1)} />
                           </div>
                    </section>

                    <div className="space-y-8">
                        <DetailSection title="Evaluation Criteria" icon={<StarIcon className="w-7 h-7" />}>
                            <ReportField label="Marking Regularity" value={<StarRatingDisplay rating={report.markingRegularity} />} />
                            <hr/>
                            <ReportField label="Feedback Quality" value={<StarRatingDisplay rating={report.feedbackQuality} />} />
                             <hr/>
                            <ReportField label="Learner Neatness / Handwriting" value={<StarRatingDisplay rating={report.learnerNeatness} />} />
                        </DetailSection>

                        <DetailSection title="Observations & Follow-up" icon={<BookOpenIcon className="w-7 h-7" />}>
                            <ReportField label="Exemplary Work Noted" value={report.exemplaryWorkNoted} />
                            <hr/>
                            <ReportField label="Common Student Errors" value={report.commonStudentErrors} />
                            <hr/>
                            <ReportField label="Teacher's Response to Previous Feedback" value={report.teacherResponseToFeedback} />
                            <hr/>
                            <ReportField label="General Comments & Recommendations" value={report.comments} />
                        </DetailSection>
                    </div>
                </div>
            </div>

            <PdfDocument 
                id={pdfElementId} 
                title="Book Checking Report"
                schoolName={appSettings.schoolName}
                schoolLogo={appSettings.schoolLogo}
                footerText={appSettings.reportFooter}
            >
                <BookCheckingPdfContent report={report} />
            </PdfDocument>

            <PdfPreviewModal
                isOpen={isPreviewOpen}
                pdfUrl={pdfDoc ? pdfDoc.output('datauristring') : null}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                title="Book Checking Report Preview"
            />
        </>
    );
};

export const BookCheckingModule: React.FC<{ initialReportIdToShow?: string; onClearActiveReport: () => void; }> = ({ initialReportIdToShow, onClearActiveReport }) => {
    const reports = useLiveQuery<BookCheckingReport[]>(() => dbTyped.bookCheckingReports.toArray(), []) ?? [];
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

    const handleSave = useCallback(async (report: BookCheckingReport) => {
        await dbTyped.bookCheckingReports.put(report);
        setView('LIST');
        setSelectedReportId(null);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            await dbTyped.bookCheckingReports.delete(id);
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
            const elementIds = filteredAndSortedReports.map(r => `bulk-pdf-book-checking-${r.id}`);
            const pdf = await generateBulkPdfDocument(elementIds);
            if (pdf) {
                pdf.save(`Book_Checking_Reports_Bulk_Export_${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                alert('Failed to generate bulk PDF.');
            }
            setIsBulkExporting(false);
        };
        setTimeout(performExport, 100);

    }, [isBulkExporting, filteredAndSortedReports]);

    const selectedReport = reports.find(r => r.id === selectedReportId);

    if (view === 'FORM') {
        return <BookCheckingForm onSave={handleSave} onCancel={handleBackToList} initialData={selectedReport} teachers={teachers} />;
    }
    if (view === 'DETAIL' && selectedReport) {
        return <BookCheckingDetailView report={selectedReport} onBack={handleBackToList} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <ReportHeader title="Book Checking Reports" onAddNew={() => { setSelectedReportId(null); setView('FORM'); }} />
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
                            {searchQuery || filterStartDate || filterEndDate ? 'No Reports Found' : 'No Book Checking Reports Yet'}
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
                            id={`bulk-pdf-book-checking-${report.id}`}
                            title="Book Checking Report"
                            schoolName={appSettings.schoolName}
                            schoolLogo={appSettings.schoolLogo}
                            footerText={appSettings.reportFooter}
                        >
                            <BookCheckingPdfContent report={report} />
                        </PdfDocument>
                    ))}
                </div>
            )}
        </div>
    );
};
