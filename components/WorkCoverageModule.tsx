
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { WorkCoverageReport, Teacher, AppSetting } from '../types';
import { dbTyped } from '../utils/db';
import { generatePdfDocument, generateBulkPdfDocument } from '../utils/pdfUtils';
import { FormInput, FormTextarea, FormSelect, ReportHeader, ReportListItem, ReportDetailViewHeader, ReportField, PdfPreviewModal, Fieldset, SignaturePad, DetailSection, PdfDocument, PdfSection, PdfField } from './common/ReportComponents';
import { SearchIcon, ChartBarIcon, PencilIcon, DocumentDuplicateIcon } from './Icons';
import { useLiveQuery } from '../hooks/useLocalStorage';

const emptyForm: WorkCoverageReport = {
    id: '', teacherName: '', className: '', subject: '', date: '', plannedTopics: '', completedTopics: '', pendingTopics: '', remarks: '', teacherSignature: '', supervisorSignature: ''
};

const WorkCoverageForm: React.FC<{
    onSave: (report: WorkCoverageReport) => void;
    onCancel: () => void;
    initialData?: WorkCoverageReport;
    teachers: Teacher[];
}> = ({ onSave, onCancel, initialData, teachers }) => {
    const [formData, setFormData] = useState<WorkCoverageReport>(initialData || emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof WorkCoverageReport, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target as {name: keyof WorkCoverageReport, value: string};
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSignatureChange = (name: 'teacherSignature' | 'supervisorSignature', dataUrl: string) => {
        setFormData(prev => ({ ...prev, [name]: dataUrl }));
         if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof WorkCoverageReport, string>> = {};
        if (!formData.teacherName.trim()) newErrors.teacherName = "Teacher name is required.";
        if (!formData.className.trim()) newErrors.className = "Class is required.";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
        if (!formData.date) newErrors.date = "Date is required.";
        if (!formData.plannedTopics.trim()) newErrors.plannedTopics = "Planned topics are required.";
        if (!formData.completedTopics.trim()) newErrors.completedTopics = "Completed topics are required.";
        if (!formData.teacherSignature) newErrors.teacherSignature = "Teacher signature is required.";
        if (!formData.supervisorSignature) newErrors.supervisorSignature = "Supervisor signature is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave({ ...formData, id: formData.id || Date.now().toString() });
        } else {
            alert("Please fill out all required fields, including signatures.");
        }
    };

    const renderError = (field: keyof WorkCoverageReport) => {
        return errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">{initialData ? 'Edit' : 'Create'} Work Coverage Report</h3>
            
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
                </div>
            </Fieldset>

            <Fieldset legend="Syllabus Coverage">
                <div>
                    <FormTextarea label="Planned Topics (from scheme of work)" id="plannedTopics" value={formData.plannedTopics} onChange={handleChange} rows={4} required />
                    {renderError('plannedTopics')}
                </div>
                <div>
                    <FormTextarea label="Topics Completed" id="completedTopics" value={formData.completedTopics} onChange={handleChange} rows={4} required />
                    {renderError('completedTopics')}
                </div>
                <FormTextarea label="Topics Pending" id="pendingTopics" value={formData.pendingTopics} onChange={handleChange} rows={4} />
                <FormTextarea label="Remarks on Delays / Missed Lessons" id="remarks" value={formData.remarks} onChange={handleChange} rows={3} />
            </Fieldset>
            
            <Fieldset legend="Signatures">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <SignaturePad
                            label="Teacher Signature"
                            onEnd={(dataUrl) => handleSignatureChange('teacherSignature', dataUrl)}
                            initialDataUrl={formData.teacherSignature}
                        />
                        {renderError('teacherSignature')}
                    </div>
                    <div>
                        <SignaturePad
                            label="Supervisor Signature"
                            onEnd={(dataUrl) => handleSignatureChange('supervisorSignature', dataUrl)}
                            initialDataUrl={formData.supervisorSignature}
                        />
                        {renderError('supervisorSignature')}
                    </div>
                </div>
            </Fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Report</button>
            </div>
        </form>
    );
};

const renderSignatureForPdf = (signatureData: string) => {
    if (signatureData && signatureData.startsWith('data:image/')) {
        return <img src={signatureData} alt="Signature" className="h-24 w-auto border border-gray-400 p-1" />;
    }
    return <p className="h-24 border border-gray-400 p-1 font-serif italic flex items-center justify-center">{signatureData || 'N/A'}</p>;
};

const WorkCoveragePdfContent: React.FC<{ report: WorkCoverageReport }> = ({ report }) => (
    <>
        <PdfSection title="Summary">
            <PdfField label="Teacher Name">{report.teacherName}</PdfField>
            <PdfField label="Class Name">{report.className}</PdfField>
            <PdfField label="Subject">{report.subject}</PdfField>
            <PdfField label="Date">{new Date(report.date).toLocaleDateString()}</PdfField>
        </PdfSection>
        <PdfSection title="Syllabus Coverage">
            <PdfField label="Planned Topics" fullWidth>{report.plannedTopics}</PdfField>
            <PdfField label="Topics Completed" fullWidth>{report.completedTopics}</PdfField>
            <PdfField label="Topics Pending" fullWidth>{report.pendingTopics}</PdfField>
            <PdfField label="Remarks" fullWidth>{report.remarks}</PdfField>
        </PdfSection>
        <PdfSection title="Signatures">
            <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center">
                    {renderSignatureForPdf(report.teacherSignature)}
                    <p className="border-t border-gray-400 mt-2 pt-1 text-sm text-gray-600">Teacher's Signature</p>
                </div>
                <div className="text-center">
                    {renderSignatureForPdf(report.supervisorSignature)}
                    <p className="border-t border-gray-400 mt-2 pt-1 text-sm text-gray-600">Supervisor's Signature</p>
                </div>
            </div>
        </PdfSection>
    </>
);

const WorkCoverageDetailView: React.FC<{ report: WorkCoverageReport; onBack: () => void; }> = ({ report, onBack }) => {
    const settings = useLiveQuery<AppSetting[]>(() => dbTyped.settings.toArray(), []) ?? [];
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any | null>(null);
    const pdfElementId = `work-coverage-report-pdf-${report.id}`;

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
            pdfDoc.save(`Work_Coverage_${report.teacherName.replace(/\s/g, '_')}_${report.date}.pdf`);
            setPreviewOpen(false);
            setPdfDoc(null);
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPdfDoc(null);
    };

    const renderSignature = (signatureData: string) => {
        if (signatureData && signatureData.startsWith('data:image/')) {
            return <img src={signatureData} alt="Signature" className="h-20 w-auto bg-gray-50 border border-gray-300 rounded-md object-contain p-1" />;
        }
        return <p className="mt-1 text-md text-gray-900 font-serif italic">{signatureData || 'N/A'}</p>;
    };

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                 <ReportDetailViewHeader title="Work Coverage Report" onBack={onBack} onExport={handlePreview} />
                <div className="p-4 sm:p-8">
                     <header className="text-center mb-10 border-b pb-6">
                         <h1 className="text-3xl font-bold text-gray-900">Work Coverage Report</h1>
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
                        <DetailSection title="Syllabus Coverage" icon={<ChartBarIcon className="w-7 h-7" />}>
                            <ReportField label="Planned Topics (from scheme of work)" value={report.plannedTopics} />
                            <hr/>
                            <ReportField label="Topics Completed" value={report.completedTopics} />
                            <hr/>
                            <ReportField label="Topics Pending" value={report.pendingTopics} />
                            <hr/>
                            <ReportField label="Remarks on Delays / Missed Lessons" value={report.remarks} />
                        </DetailSection>
                        
                        <DetailSection title="Signatures" icon={<PencilIcon className="w-7 h-7" />}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Teacher Signature</h4>
                                    {renderSignature(report.teacherSignature)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Supervisor Signature</h4>
                                    {renderSignature(report.supervisorSignature)}
                                </div>
                             </div>
                        </DetailSection>
                    </div>
                </div>
            </div>
            
            <PdfDocument 
                id={pdfElementId} 
                title="Work Coverage Report"
                schoolName={appSettings.schoolName}
                schoolLogo={appSettings.schoolLogo}
                footerText={appSettings.reportFooter}
            >
                <WorkCoveragePdfContent report={report} />
            </PdfDocument>

            <PdfPreviewModal
                isOpen={isPreviewOpen}
                pdfUrl={pdfDoc ? pdfDoc.output('datauristring') : null}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                title="Work Coverage Report Preview"
            />
        </>
    );
};

export const WorkCoverageModule: React.FC<{ initialReportIdToShow?: string; onClearActiveReport: () => void; }> = ({ initialReportIdToShow, onClearActiveReport }) => {
    const reports = useLiveQuery<WorkCoverageReport[]>(() => dbTyped.workCoverageReports.toArray(), []) ?? [];
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

    const handleSave = useCallback(async (report: WorkCoverageReport) => {
        await dbTyped.workCoverageReports.put(report);
        setView('LIST');
        setSelectedReportId(null);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            await dbTyped.workCoverageReports.delete(id);
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
            const elementIds = filteredAndSortedReports.map(r => `bulk-pdf-work-coverage-${r.id}`);
            const pdf = await generateBulkPdfDocument(elementIds);
            if (pdf) {
                pdf.save(`Work_Coverage_Reports_Bulk_Export_${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                alert('Failed to generate bulk PDF.');
            }
            setIsBulkExporting(false);
        };
        setTimeout(performExport, 100);

    }, [isBulkExporting, filteredAndSortedReports]);

    const selectedReport = reports.find(r => r.id === selectedReportId);

    if (view === 'FORM') {
        return <WorkCoverageForm onSave={handleSave} onCancel={handleBackToList} initialData={selectedReport} teachers={teachers} />;
    }
    if (view === 'DETAIL' && selectedReport) {
        return <WorkCoverageDetailView report={selectedReport} onBack={handleBackToList} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <ReportHeader title="Work Coverage Reports" onAddNew={() => { setSelectedReportId(null); setView('FORM'); }} />
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
                           {searchQuery || filterStartDate || filterEndDate ? 'No Reports Found' : 'No Work Coverage Reports Yet'}
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
                            id={`bulk-pdf-work-coverage-${report.id}`}
                            title="Work Coverage Report"
                            schoolName={appSettings.schoolName}
                            schoolLogo={appSettings.schoolLogo}
                            footerText={appSettings.reportFooter}
                        >
                            <WorkCoveragePdfContent report={report} />
                        </PdfDocument>
                    ))}
                </div>
            )}
        </div>
    );
};
