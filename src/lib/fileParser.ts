import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Bulletproof Cloud Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const parseFile = async (file: File): Promise<{ content: string }> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    try {
        if (extension === 'pdf') return await parsePDF(file);
        if (['docx', 'doc'].includes(extension!)) return await parseWord(file);
        if (['xlsx', 'xls', 'csv'].includes(extension!)) return await parseSpreadsheet(file);
        return { content: await file.text() }; // Default for .txt, .md
    } catch (error: any) {
        throw new Error(`Cannot read .${extension} file. Ensure it is not encrypted.`);
    }
};

const parsePDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
    return { content: text };
};

const parseWord = async (file: File) => {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { content: result.value };
};

const parseSpreadsheet = async (file: File) => {
    const workbook = XLSX.read(await file.arrayBuffer());
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return { content: XLSX.utils.sheet_to_txt(firstSheet) };
};