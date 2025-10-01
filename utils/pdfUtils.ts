
// @ts-nocheck

const generateCanvas = async (elementId: string) => {
    const input = document.getElementById(elementId);
    if (!input) {
      console.error(`Element with id ${elementId} not found.`);
      return null;
    }
     // Temporarily increase resolution for better quality
    const scale = 2;
    return await html2canvas(input, {
        scale: scale,
        useCORS: true,
        logging: false,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
    });
};

export const generatePdfDocument = async (elementId: string): Promise<any | null> => {
    const canvas = await generateCanvas(elementId);
    if (!canvas) return null;

    const imgData = canvas.toDataURL('image/png');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth;
    let imgHeight = imgWidth / ratio;

    if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * ratio;
    }
    
    const x = (pdfWidth - imgWidth) / 2;
    const y = 0;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    return pdf;
};

export const generateBulkPdfDocument = async (elementIds: string[]): Promise<any | null> => {
    if (!elementIds || elementIds.length === 0) return null;
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    for (let i = 0; i < elementIds.length; i++) {
        const elementId = elementIds[i];
        const canvas = await generateCanvas(elementId);
        
        if (canvas) {
            if (i > 0) {
                pdf.addPage();
            }
            
            const imgData = canvas.toDataURL('image/png');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / ratio;

            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * ratio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = 0;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }
    }

    return pdf;
};

export const exportToPdf = async (elementId: string, fileName: string): Promise<void> => {
    const pdf = await generatePdfDocument(elementId);
    if (pdf) {
        pdf.save(`${fileName}.pdf`);
    }
};
