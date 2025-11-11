/**
 * PDF Generation API Client
 * Handles resume PDF generation via LaTeX
 * Related to UC-053: Export Resume
 */

const API_BASE = 'http://localhost:8000/api/resumes';

const PDFAPI = {
  /**
   * Generate PDF from resume data with options
   */
  generatePDF: async (resumeId, options = {}) => {
    try {
      const body = options && Object.keys(options).length > 0 ? options : undefined;

      const response = await fetch(`${API_BASE}/${resumeId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate PDF');
      }

      return response.json();
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(err?.detail || 'Failed to generate PDF');
    }
  },

  /**
   * Generate preview PDF for current resume state
   * Used for real-time preview during editing
   */
  generatePreviewPDF: async (resumeId, resumeData) => {
    try {
      const response = await fetch(`${API_BASE}/${resumeId}/preview-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate PDF preview');
      }

      return response.json();
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(err?.detail || 'Failed to generate PDF preview');
    }
  },

  /**
   * Convert hex string to PDF blob
   */
  hexToBlob: (hexString) => {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  },

  /**
   * Get PDF blob URL for display
   */
  getPDFBlobURL: (hexString) => {
    const blob = PDFAPI.hexToBlob(hexString);
    return URL.createObjectURL(blob);
  },
};

export default PDFAPI;
