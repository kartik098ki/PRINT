import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - use CDN for reliability without complex build setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const getPdfPageCount = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        return pdf.numPages;
    } catch (error) {
        console.error("Error counting PDF pages:", error);
        return 1; // Fallback to 1 if detection fails
    }
};
