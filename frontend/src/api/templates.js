/**
 * Templates API Client
 * Related to UC-046: Resume Template Management
 */

const API_BASE = 'http://localhost:8000/api/templates';

const TemplatesAPI = {
  /**
   * Create a new template
   */
  add: async (templateData) => {
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create template');
    }

    return response.json();
  },

  /**
   * Get all templates for the current user
   */
  getUserTemplates: async () => {
    try {
      const response = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `Failed to fetch templates (${response.status})`);
      }

      return response.json();
    } catch (err) {
      // If it's already an Error, re-throw it
      if (err instanceof Error) {
        throw err;
      }
      // Otherwise wrap it
      throw new Error(err?.detail || 'Failed to fetch templates');
    }
  },

  /**
   * Get the user's default template
   */
  getDefaultTemplate: async () => {
    const response = await fetch(`${API_BASE}/default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch default template');
    }

    return response.json();
  },

  /**
   * Get public templates
   */
  getPublicTemplates: async (limit = 20) => {
    const response = await fetch(`${API_BASE}/public?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch public templates');
    }

    return response.json();
  },

  /**
   * Get a specific template
   */
  get: async (templateId) => {
    const response = await fetch(`${API_BASE}?template_id=${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch template');
    }

    return response.json();
  },

  /**
   * Update a template
   */
  update: async (templateId, templateData) => {
    const response = await fetch(`${API_BASE}?template_id=${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update template');
    }

    return response.json();
  },

  /**
   * Delete a template
   */
  delete: async (templateId) => {
    const response = await fetch(`${API_BASE}?template_id=${templateId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete template');
    }

    return response.json();
  },

  /**
   * Set a template as default
   */
  setDefaultTemplate: async (templateId) => {
    const response = await fetch(`${API_BASE}/${templateId}/set-default`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to set default template');
    }

    return response.json();
  },

  /**
   * Create a template from an existing resume
   */
  createFromResume: async (resumeId, templateName) => {
    const response = await fetch(`${API_BASE}/${resumeId}/from-resume?name=${templateName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create template from resume');
    }

    return response.json();
  },

  /**
   * Share a template with other users
   */
  shareTemplate: async (templateId, userIds) => {
    const response = await fetch(`${API_BASE}/${templateId}/share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ user_ids: userIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to share template');
    }

    return response.json();
  },

  /**
   * Search templates
   */
  search: async (query) => {
    const response = await fetch(`${API_BASE}/search/${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to search templates');
    }

    return response.json();
  },
};

export default TemplatesAPI;
