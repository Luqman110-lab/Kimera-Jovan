import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { dbTyped } from '../utils/db';
import { AppSetting } from '../types';
import { useLiveQuery } from '../hooks/useLocalStorage';
import { FormInput, FormTextarea } from './common/ReportComponents';
import { DownloadIcon, UploadIcon, ExclamationTriangleIcon } from './Icons';

const SETTING_KEYS = {
    SCHOOL_NAME: 'schoolName',
    SCHOOL_ADDRESS: 'schoolAddress',
    SCHOOL_LOGO: 'schoolLogo',
    REPORT_FOOTER: 'reportFooter',
};

const SettingsCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const SettingsModule: React.FC = () => {
    const settings = useLiveQuery<AppSetting[]>(() => dbTyped.settings.toArray(), []) ?? [];
    
    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [schoolLogo, setSchoolLogo] = useState('');
    const [reportFooter, setReportFooter] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';
        setSchoolName(getSetting(SETTING_KEYS.SCHOOL_NAME));
        setSchoolAddress(getSetting(SETTING_KEYS.SCHOOL_ADDRESS));
        setSchoolLogo(getSetting(SETTING_KEYS.SCHOOL_LOGO));
        setReportFooter(getSetting(SETTING_KEYS.REPORT_FOOTER));
    }, [settings]);

    const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await dbTyped.settings.bulkPut([
                { key: SETTING_KEYS.SCHOOL_NAME, value: schoolName },
                { key: SETTING_KEYS.SCHOOL_ADDRESS, value: schoolAddress },
                { key: SETTING_KEYS.SCHOOL_LOGO, value: schoolLogo },
                { key: SETTING_KEYS.REPORT_FOOTER, value: reportFooter },
            ]);
            showFeedback('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            showFeedback('Failed to save settings.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSchoolLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExportData = async () => {
        try {
            const data = {
                teachers: await dbTyped.teachers.toArray(),
                supervisionReports: await dbTyped.supervisionReports.toArray(),
                bookCheckingReports: await dbTyped.bookCheckingReports.toArray(),
                workCoverageReports: await dbTyped.workCoverageReports.toArray(),
                settings: await dbTyped.settings.toArray(),
            };
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teacher-monitor-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showFeedback('Data exported successfully.');
        } catch (error) {
            console.error("Export failed:", error);
            showFeedback('Data export failed.', 'error');
        }
    };

    const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Are you sure you want to import data? This will overwrite all existing application data.")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                
                // FIX: The transaction method exists on the Dexie instance, not the dbTyped helper object.
                // The Dexie instance can be accessed via the .db property of any table.
                await dbTyped.teachers.db.transaction('rw', Object.values(dbTyped), async () => {
                    await Promise.all(Object.values(dbTyped).map(table => table.clear()));
                    
                    if (data.teachers) await dbTyped.teachers.bulkAdd(data.teachers);
                    if (data.supervisionReports) await dbTyped.supervisionReports.bulkAdd(data.supervisionReports);
                    if (data.bookCheckingReports) await dbTyped.bookCheckingReports.bulkAdd(data.bookCheckingReports);
                    if (data.workCoverageReports) await dbTyped.workCoverageReports.bulkAdd(data.workCoverageReports);
                    if (data.settings) await dbTyped.settings.bulkAdd(data.settings);
                });
                
                showFeedback('Data imported successfully! The application will now reload.');
                setTimeout(() => window.location.reload(), 2000);

            } catch (error) {
                console.error("Import failed:", error);
                showFeedback('Failed to import data. Please ensure the file is a valid backup.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    const handleClearData = async () => {
        if (!window.confirm("DANGER: You are about to delete ALL application data. This action is irreversible. Are you absolutely sure?")) {
            return;
        }
        const confirmation = prompt("To confirm this action, please type 'DELETE' in the box below.");
        if (confirmation === 'DELETE') {
            try {
                // FIX: Wrap multiple clear operations in a single transaction for atomicity and performance.
                await dbTyped.teachers.db.transaction('rw', Object.values(dbTyped), async () => {
                    await Promise.all(Object.values(dbTyped).map(table => table.clear()));
                });
                showFeedback('All application data has been cleared. The application will now reload.');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Failed to clear data:", error);
                showFeedback('An error occurred while clearing data.', 'error');
            }
        } else {
            alert("Deletion cancelled. The text you entered did not match 'DELETE'.");
        }
    };


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>

            {feedback && (
                <div className={`p-4 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
            
            <SettingsCard title="School Information & Branding">
                <FormInput label="School Name" id="schoolName" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g., Northwood High School" />
                <FormTextarea label="School Address" id="schoolAddress" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} rows={3} placeholder="e.g., 123 Education Lane, Knowledge City, 45678" />
                <div>
                    <label className="block text-sm font-medium text-gray-700">School Logo</label>
                    <div className="mt-2 flex items-center space-x-6">
                        <div className="shrink-0">
                            {schoolLogo ? (
                                <img className="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" src={schoolLogo} alt="School Logo Preview" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Logo</div>
                            )}
                        </div>
                        <label className="block">
                            <span className="sr-only">Choose profile photo</span>
                            <input type="file" onChange={handleLogoUpload} accept="image/png, image/jpeg, image/svg+xml" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        </label>
                    </div>
                </div>
            </SettingsCard>

             <SettingsCard title="Report Configuration">
                <FormTextarea label="Custom Report Footer" id="reportFooter" value={reportFooter} onChange={(e) => setReportFooter(e.target.value)} rows={2} placeholder="e.g., 'Confidential: For Internal Use Only'" />
                <p className="text-xs text-gray-500">This text will appear at the bottom of all exported PDF reports.</p>
            </SettingsCard>
            
            <div className="flex justify-end">
                 <button onClick={handleSaveSettings} disabled={isSaving} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            <SettingsCard title="Data Management">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-2">
                        <h4 className="font-medium text-gray-700">Export Data</h4>
                        <p className="text-sm text-gray-500">Download a full backup of all teachers, reports, and settings as a single JSON file.</p>
                        <div className="pt-2">
                            <button onClick={handleExportData} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Export All Data
                            </button>
                        </div>
                    </div>
                     <div className="flex flex-col space-y-2">
                        <h4 className="font-medium text-gray-700">Import Data</h4>
                        <p className="text-sm text-gray-500">Restore application data from a previously exported backup file. This will overwrite existing data.</p>
                         <div className="pt-2">
                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                <UploadIcon className="w-5 h-5 mr-2" />
                                Import from File
                                <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                            </label>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-red-800">Danger Zone</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>This action will permanently delete all data, including teachers, reports, and settings. This cannot be undone.</p>
                        </div>
                        <div className="mt-4">
                            <button onClick={handleClearData} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Clear All Application Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
