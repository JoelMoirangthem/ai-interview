const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('A PDF buffer is required');
    }
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
};

module.exports = { extractTextFromPDF };
