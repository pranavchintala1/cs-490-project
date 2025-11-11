/**
 * PDF Generation API Client
 * Handles resume PDF generation via LaTeX
 * Related to UC-053: Export Resume
 */

const API_BASE = 'http://localhost:8000/api/resumes';

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('session');
  const uuid = localStorage.getItem('uuid');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('[PDFAPI] No session token found in localStorage');
  }
  if (uuid) {
    headers['uuid'] = uuid;
  } else {
    console.warn('[PDFAPI] No uuid found in localStorage');
  }
  console.log('[PDFAPI] Auth headers prepared:', { hasToken: !!token, hasUuid: !!uuid });
  return headers;
};

const PDFAPI = {
  /**
   * Generate PDF from resume data with options
   */
  generatePDF: async (resumeId, options = {}) => {
    try {
      const body = options && Object.keys(options).length > 0 ? options : undefined;

      const response = await fetch(`${API_BASE}/${resumeId}/generate-pdf`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      console.log('[PDFAPI] Generating preview PDF for resume:', resumeId);
      const headers = getAuthHeaders();
      const body = JSON.stringify(resumeData);
      console.log('[PDFAPI] Request body size:', body.length, 'bytes');

      const response = await fetch(`${API_BASE}/${resumeId}/preview-pdf`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: body,
      });

      console.log('[PDFAPI] Response status:', response.status);

      if (!response.ok) {
        let errorDetail = 'Failed to generate PDF preview';
        try {
          const error = await response.json();
          errorDetail = error.detail || error.message || errorDetail;
          console.error('[PDFAPI] Error response:', error);
        } catch (e) {
          console.error('[PDFAPI] Could not parse error response');
        }
        throw new Error(errorDetail);
      }

      const result = await response.json();
      console.log('[PDFAPI] Preview PDF generated successfully');
      return result;
    } catch (err) {
      console.error('[PDFAPI] Preview PDF generation error:', err);
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
