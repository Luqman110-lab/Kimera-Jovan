import React, { useState, useCallback, useEffect } from 'react';
import { Teacher } from '../types';
import { dbTyped } from '../utils/db';
import { FormInput, FormTextarea, ReportHeader } from './common/ReportComponents';
import { TrashIcon, UserGroupIcon } from './Icons';
import { useLiveQuery } from '../hooks/useLocalStorage';

const TeacherForm: React.FC<{
    onSave: (teacher: Teacher) => void;
    onCancel: () => void;
    initialData?: Teacher;
}> = ({ onSave, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [subjects, setSubjects] = useState(initialData?.subjects.join(', ') || '');
    const [classes, setClasses] = useState(initialData?.classes.join(', ') || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Teacher name is required.');
            return;
        }
        setError('');
        onSave({
            id: initialData?.id || Date.now().toString(),
            name: name.trim(),
            subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
            classes: classes.split(',').map(c => c.trim()).filter(Boolean),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">{initialData ? 'Edit' : 'Add New'} Teacher</h3>
            <div>
                <FormInput
                    label="Teacher Name"
                    id="teacherName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., John Smith"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <FormTextarea
                label="Subjects Taught (comma-separated)"
                id="subjects"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="e.g., Math, Science, History"
                rows={3}
            />
            <FormTextarea
                label="Classes Handled (comma-separated)"
                id="classes"
                value={classes}
                onChange={(e) => setClasses(e.target.value)}
                placeholder="e.g., Grade 5A, Grade 6B"
                rows={3}
            />
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Teacher</button>
            </div>
        </form>
    );
};

const TeacherListItem: React.FC<{
    teacher: Teacher;
    onEdit: (teacher: Teacher) => void;
    onDelete: (id: string) => void;
    onViewProfile: (id: string) => void;
}> = ({ teacher, onEdit, onDelete, onViewProfile }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center transition hover:shadow-md">
        <div>
            <p className="font-semibold text-indigo-700 text-lg">{teacher.name}</p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">Subjects:</span> {teacher.subjects.join(', ') || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">Classes:</span> {teacher.classes.join(', ') || 'N/A'}
            </p>
        </div>
        <div className="space-x-2">
            <button onClick={() => onViewProfile(teacher.id)} className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">View Profile</button>
            <button onClick={() => onEdit(teacher)} className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">Edit</button>
            <button onClick={() => onDelete(teacher.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

export const TeacherManagementModule: React.FC<{ 
    onViewProfile: (teacherId: string) => void;
    initialTeacherToEditId?: string | null;
    onClearTeacherToEdit: () => void;
}> = ({ onViewProfile, initialTeacherToEditId, onClearTeacherToEdit }) => {
    const teachers = useLiveQuery<Teacher[]>(() => dbTyped.teachers.toArray(), []) ?? [];
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>(undefined);

    useEffect(() => {
        if (initialTeacherToEditId) {
            const teacherToEdit = teachers.find(t => t.id === initialTeacherToEditId);
            if (teacherToEdit) {
                setSelectedTeacher(teacherToEdit);
                setView('FORM');
            }
        }
    }, [initialTeacherToEditId, teachers]);

    const handleSave = useCallback(async (teacher: Teacher) => {
        await dbTyped.teachers.put(teacher);
        setView('LIST');
        setSelectedTeacher(undefined);
        if(initialTeacherToEditId) onClearTeacherToEdit();
    }, [initialTeacherToEditId, onClearTeacherToEdit]);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
            await dbTyped.teachers.delete(id);
        }
    }, []);
    
    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setView('FORM');
    };

    const handleAddNew = () => {
        setSelectedTeacher(undefined);
        setView('FORM');
    };

    const handleCancelForm = () => {
        setView('LIST');
        setSelectedTeacher(undefined);
        if(initialTeacherToEditId) onClearTeacherToEdit();
    }

    if (view === 'FORM') {
        return <TeacherForm onSave={handleSave} onCancel={handleCancelForm} initialData={selectedTeacher} />;
    }

    return (
        <div>
            <ReportHeader title="Manage Teachers" onAddNew={handleAddNew} />
            <div className="space-y-4">
                {teachers.length > 0 ? (
                    teachers
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(teacher => (
                            <TeacherListItem key={teacher.id} teacher={teacher} onEdit={handleEdit} onDelete={handleDelete} onViewProfile={onViewProfile} />
                        ))
                ) : (
                    <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">No Teachers Found</h3>
                        <p className="mt-1 text-sm">Get started by adding a new teacher.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
