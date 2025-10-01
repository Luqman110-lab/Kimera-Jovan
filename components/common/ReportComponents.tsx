
import React, { ChangeEvent, ReactNode, useState, useRef, useEffect } from 'react';
import { TrashIcon, DownloadIcon, ChevronLeftIcon, PlusIcon, StarIcon, XCircleIcon, LogoIcon } from '../Icons';

// --- Form Components ---

interface FormInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}
export const FormInput: React.FC<FormInputProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input id={id} name={id} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
  </div>
);

interface FormTextareaProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}
export const FormTextarea: React.FC<FormTextareaProps> = ({ label, id, value, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea id={id} name={id} value={value} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
  </div>
);

interface FormSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  required?: boolean;
}
export const FormSelect: React.FC<FormSelectProps> = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select id={id} name={id} {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
      {children}
    </select>
  </div>
);

interface FieldsetProps {
    legend: string;
    children: ReactNode;
}
export const Fieldset: React.FC<FieldsetProps> = ({ legend, children }) => (
    <fieldset className="border border-gray-300 p-4 rounded-md">
        <legend className="px-2 text-lg font-semibold text-gray-800">{legend}</legend>
        <div className="space-y-6">
            {children}
        </div>
    </fieldset>
);

interface StarRatingInputProps {
    label: string;
    id: string;
    value: number;
    onChange: (name: string, value: number) => void;
    maxRating?: number;
}
export const StarRatingInput: React.FC<StarRatingInputProps> = ({ label, id, value, onChange, maxRating = 5 }) => {
    const [hoverValue, setHoverValue] = useState(0);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-1">
                {[...Array(maxRating)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <button
                            type="button"
                            key={ratingValue}
                            onClick={() => onChange(id, ratingValue)}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(0)}
                            className="focus:outline-none"
                            aria-label={`Set rating to ${ratingValue}`}
                        >
                            <StarIcon className={`w-8 h-8 transition-colors duration-200 ${
                                ratingValue <= (hoverValue || value) ? 'text-yellow-400' : 'text-gray-300'
                            }`} />
                        </button>
                    );
                })}
                 <span className="ml-4 text-gray-600 font-semibold">{value > 0 ? `${value} / ${maxRating}` : 'No rating'}</span>
            </div>
        </div>
    );
};

export const StarRatingDisplay: React.FC<{ rating: number; maxRating?: number }> = ({ rating, maxRating = 5 }) => (
    <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => (
            <StarIcon key={index} className={`w-6 h-6 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
        <span className="ml-2 text-md font-semibold text-gray-700">{rating} / {maxRating}</span>
    </div>
);

// --- Report Components ---

interface ReportHeaderProps {
  title: string;
  onAddNew: () => void;
}
export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, onAddNew }) => (
    <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <button
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Report
        </button>
    </div>
);

interface ReportListItemProps {
    report: { id: string; teacherName: string; subject: string; date: string; };
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}
export const ReportListItem: React.FC<ReportListItemProps> = ({ report, onSelect, onDelete }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center transition hover:shadow-md">
        <div>
            <p className="font-semibold text-indigo-700">{report.teacherName} - {report.subject}</p>
            <p className="text-sm text-gray-500">Date: {new Date(report.date).toLocaleDateString()}</p>
        </div>
        <div className="space-x-2">
            <button onClick={() => onSelect(report.id)} className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">View</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(report.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

interface ReportDetailViewHeaderProps {
    title: string;
    onBack: () => void;
    onExport: () => void;
}
export const ReportDetailViewHeader: React.FC<ReportDetailViewHeaderProps> = ({ title, onBack, onExport }) => (
    <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to List
        </button>
        <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800 hidden sm:block">{title}</h2>
            <button onClick={onExport} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <DownloadIcon className="w-5 h-5 mr-2" />
                Export to PDF
            </button>
        </div>
    </div>
);

interface ReportFieldProps {
    label: string;
    value: ReactNode;
    fullWidth?: boolean;
}
export const ReportField: React.FC<ReportFieldProps> = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <p className="mt-1 text-md text-gray-900 whitespace-pre-wrap">{value || 'N/A'}</p>
    </div>
);

export const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
            <span className="text-indigo-600">{icon}</span>
            <h3 className="ml-3 text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-4 text-gray-700 whitespace-pre-wrap">{children}</div>
    </div>
);

export const PdfPreviewModal: React.FC<{
    isOpen: boolean;
    pdfUrl: string | null;
    onClose: () => void;
    onDownload: () => void;
    title?: string;
}> = ({ isOpen, pdfUrl, onClose, onDownload, title = "PDF Preview" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
                </div>
                <div className="flex-grow p-2 bg-gray-200">
                    {pdfUrl ? (
                        <iframe src={pdfUrl} className="w-full h-full border-none" title={title} />
                    ) : (
                        <div className="w-full h-full flex justify-center items-center text-gray-500">
                            Loading preview...
                        </div>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end space-x-4 bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={onDownload} 
                        disabled={!pdfUrl}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SignaturePad: React.FC<{
    label: string;
    onEnd: (dataUrl: string) => void;
    initialDataUrl?: string;
}> = ({ label, onEnd, initialDataUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(!!initialDataUrl);

    const getCanvasContext = () => canvasRef.current?.getContext('2d');

    const drawPlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sign here', width / 2, height / 2);
    };

    // Effect for initializing and updating based on the initialDataUrl prop
    useEffect(() => {
        setHasContent(!!initialDataUrl);
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (initialDataUrl) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                img.src = initialDataUrl;
            } else {
                drawPlaceholder(ctx, canvas.width, canvas.height);
            }
        }
    }, [initialDataUrl]);

    // Effect for handling resize and preserving the drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement) return;

        const resizeCanvas = () => {
            const ctx = getCanvasContext();
            if (!ctx || !canvas.parentElement) return;
            const imageData = (canvas.width > 0 && canvas.height > 0) ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
            
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 150;

            if (imageData) {
                ctx.putImageData(imageData, 0, 0);
            }
        };
        
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(canvas.parentElement);
        
        // Initial resize
        resizeCanvas();

        return () => {
            if (canvas.parentElement) {
                observer.unobserve(canvas.parentElement);
            }
        };
    }, []);

    const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const event = 'touches' in e ? e.touches[0] : e;
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const ctx = getCanvasContext();
        if (!ctx) return;
        
        if (!hasContent) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            setHasContent(true);
        }

        const coords = getCoords(e.nativeEvent);
        if (!coords) return;
        
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = getCanvasContext();
        if (!ctx) return;
        
        const coords = getCoords(e.nativeEvent);
        if (!coords) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (canvasRef.current) {
            onEnd(canvasRef.current.toDataURL());
        }
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPlaceholder(ctx, canvas.width, canvas.height);
            onEnd('');
            setHasContent(false);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`w-full h-[150px] bg-gray-50 border rounded-md cursor-crosshair touch-none transition-colors ${
                        hasContent ? 'border-indigo-500' : 'border-gray-300'
                    }`}
                />
                {hasContent && (
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 hover:text-gray-800 focus:outline-none"
                        aria-label="Clear signature"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- PDF Generation Components ---

export const PdfDocument: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    schoolName?: string;
    schoolLogo?: string;
    footerText?: string;
}> = ({ id, title, children, schoolName, schoolLogo, footerText }) => {
    const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const offscreenStyles: React.CSSProperties = {
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '794px',
        minHeight: '1123px',
        backgroundColor: 'white',
        fontFamily: 'sans-serif',
        color: '#111827',
    };

    return (
        <div id={id} style={offscreenStyles} className="relative">
            <div className="p-16">
                <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{schoolName || 'Teacher Monitoring App'}</h1>
                        <p className="text-xl text-gray-600">{title}</p>
                    </div>
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="School Logo" className="w-24 h-24 object-contain" />
                    ) : (
                        <LogoIcon className="w-20 h-20 text-indigo-700" />
                    )}
                </header>

                <main className="pb-24">
                    {children}
                </main>
            </div>
            
            <footer className="absolute bottom-8 inset-x-16 text-center border-t border-gray-300 pt-2 text-xs text-gray-500">
                <p>{footerText || `Generated on ${generatedDate} | © ${new Date().getFullYear()} Teacher Monitoring App`}</p>
            </footer>
        </div>
    );
};

export const PdfSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4 text-indigo-800">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const PdfField: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
     <div className={`mb-3 ${fullWidth ? '' : 'grid grid-cols-3 gap-4 items-start'}`}>
        <p className={`font-semibold text-gray-600 ${fullWidth ? 'mb-1' : 'col-span-1'}`}>{label}</p>
        <div className={`text-gray-800 whitespace-pre-wrap ${fullWidth ? '' : 'col-span-2'}`}>
            {children || <span className="text-gray-400">N/A</span>}
        </div>
    </div>
);
