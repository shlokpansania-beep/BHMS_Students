import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text content from a PDF file.
 * @param {File} file - A PDF File object from file input or drag-and-drop
 * @returns {Promise<{ text: string, pageCount: number, title: string }>}
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = pdf.numPages;
  const textParts = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      textParts.push(`--- Page ${i} ---\n${pageText}`);
    }
  }

  const text = textParts.join('\n\n');
  
  // Try to get title from metadata
  let title = file.name.replace(/\.pdf$/i, '');
  try {
    const metadata = await pdf.getMetadata();
    if (metadata?.info?.Title) {
      title = metadata.info.Title;
    }
  } catch {
    // Metadata not available, use filename
  }

  return { text, pageCount, title };
}
