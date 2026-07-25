import JSZip from 'jszip';

/**
 * Extract text content from a PPTX file.
 * PPTX files are ZIP archives containing XML slides.
 * @param {File} file - A PPTX File object from file input or drag-and-drop
 * @returns {Promise<{ text: string, slideCount: number, title: string }>}
 */
export async function extractTextFromPPTX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find all slide files (ppt/slides/slide1.xml, slide2.xml, etc.)
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

  const slideCount = slideFiles.length;
  const textParts = [];
  const parser = new DOMParser();

  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.files[slideFiles[i]].async('string');
    const doc = parser.parseFromString(slideXml, 'application/xml');

    // Extract text from <a:t> elements (DrawingML text nodes)
    const textNodes = doc.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/drawingml/2006/main',
      't'
    );

    const slideTexts = [];
    for (let j = 0; j < textNodes.length; j++) {
      const text = textNodes[j].textContent?.trim();
      if (text) {
        slideTexts.push(text);
      }
    }

    if (slideTexts.length > 0) {
      textParts.push(`--- Slide ${i + 1} ---\n${slideTexts.join(' ')}`);
    }
  }

  const text = textParts.join('\n\n');

  // Try to get title from core properties
  let title = file.name.replace(/\.pptx$/i, '');
  try {
    const coreXml = await zip.files['docProps/core.xml']?.async('string');
    if (coreXml) {
      const coreDoc = parser.parseFromString(coreXml, 'application/xml');
      const titleNode = coreDoc.getElementsByTagNameNS(
        'http://purl.org/dc/elements/1.1/',
        'title'
      )[0];
      if (titleNode?.textContent?.trim()) {
        title = titleNode.textContent.trim();
      }
    }
  } catch {
    // Core properties not available, use filename
  }

  return { text, slideCount, title };
}
