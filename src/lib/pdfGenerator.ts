import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  subtitle?: string;
  userName?: string;
  theme?: 'dark' | 'light';
  fileName?: string;
  orientation?: 'p' | 'l';
}

export const generateNeuralPDF = async (element: HTMLElement, options: PDFOptions) => {
  const { 
    title, 
    subtitle = 'INTELLIGENT ACADEMIC SYNCHRONIZATION REPORT', 
    userName = 'GUEST_EXPLORER', 
    theme = 'dark',
    fileName = 'Neural_Report',
    orientation = 'p'
  } = options;

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Setup for jspdf.html
    const originalStyle = element.getAttribute('style') || '';
    
    // PREMIUM STYLING INJECTION
    element.style.width = '850px';
    element.style.padding = '40px';
    element.style.fontSize = '13px';
    element.style.fontFamily = "'Inter', 'Segoe UI', Roboto, sans-serif";
    element.style.background = theme === 'dark' ? '#080808' : '#ffffff';
    element.style.color = theme === 'dark' ? '#f0f0f0' : '#1a1a1a';
    element.style.lineHeight = '1.6';

    const addPremiumBranding = (pdfDoc: jsPDF) => {
      const totalPages = (pdfDoc.internal as any).getNumberOfPages();
      
      for (let i = 1; i <= totalPages; i++) {
        pdfDoc.setPage(i);
        
        // Header Area
        pdfDoc.setFillColor(theme === 'dark' ? 10 : 252);
        pdfDoc.rect(0, 0, pageWidth, 45, 'F');

        // Decorative Accent Line (Gradient-like)
        pdfDoc.setFillColor(249, 115, 22); // Orange-500
        pdfDoc.rect(0, 0, pageWidth, 1.5, 'F');
        pdfDoc.setFillColor(37, 99, 235); // Blue-600
        pdfDoc.rect(pageWidth / 2, 0, pageWidth / 2, 1.5, 'F');

        // Logo / Title
        pdfDoc.setTextColor(theme === 'dark' ? 255 : 0);
        pdfDoc.setFontSize(20);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('NEURAL STUDY', margin, 18);

        pdfDoc.setTextColor(249, 115, 22);
        pdfDoc.setFontSize(8);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text('AI CORE V2.5', margin, 24);

        pdfDoc.setTextColor(theme === 'dark' ? 120 : 140);
        pdfDoc.setFontSize(7);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.text(subtitle.toUpperCase(), margin, 29);

        // HUD Card (Right side)
        const hudX = pageWidth - 90;
        pdfDoc.setFillColor(theme === 'dark' ? 20 : 245);
        pdfDoc.roundedRect(hudX, 10, 75, 25, 1, 1, 'F');
        
        pdfDoc.setTextColor(theme === 'dark' ? 100 : 150);
        pdfDoc.setFontSize(6);
        pdfDoc.text('IDENTIFIER', hudX + 5, 16);
        pdfDoc.setTextColor(theme === 'dark' ? 220 : 40);
        pdfDoc.setFontSize(8);
        pdfDoc.text(userName.toUpperCase(), hudX + 5, 21);
        
        pdfDoc.setTextColor(theme === 'dark' ? 100 : 150);
        pdfDoc.setFontSize(6);
        pdfDoc.text('EPOCH', hudX + 5, 27);
        pdfDoc.setTextColor(theme === 'dark' ? 220 : 40);
        pdfDoc.text(new Date().toLocaleDateString(), hudX + 5, 31);

        // Footer Area
        pdfDoc.setDrawColor(theme === 'dark' ? 30 : 230);
        pdfDoc.setLineWidth(0.2);
        pdfDoc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.setFontSize(6);
        const footerText = `ACADEMIC PROTOCOL // NEURAL_CORE_ENCRYPTED_EXPORT // PAGE ${i} OF ${totalPages}`;
        pdfDoc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }
    };

    // Temporarily enable PDF-only elements
    const pdfOnlyElements = element.querySelectorAll('.pdf-only');
    pdfOnlyElements.forEach(el => {
      (el as HTMLElement).style.setProperty('display', 'block', 'important');
    });

    await pdf.html(element, {
      callback: (doc) => {
        addPremiumBranding(doc);
        doc.save(`${fileName}_${new Date().getTime()}.pdf`);
        element.setAttribute('style', originalStyle);
        // Reset PDF-only elements
        pdfOnlyElements.forEach(el => {
          (el as HTMLElement).style.removeProperty('display');
        });
      },
      x: margin,
      y: 50,
      width: contentWidth,
      windowWidth: 850,
      autoPaging: 'text',
      html2canvas: {
        scale: 0.2645833333,
        useCORS: true,
        logging: false,
        backgroundColor: theme === 'dark' ? '#080808' : '#ffffff',
        letterRendering: true
      }
    });

    return true;
  } catch (err) {
    console.error("Neural PDF Synthesis Error:", err);
    throw err;
  }
};
