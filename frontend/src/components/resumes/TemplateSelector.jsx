import React from 'react';
import '../../styles/resumes.css';

/**
 * TemplateSelector Component
 * Display available templates with previews
 * Related to UC-046
 */
export default function TemplateSelector({ templates, selectedTemplate, onSelect }) {
  return (
    <div className="template-selector">
      {templates && templates.length > 0 ? (
        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => onSelect(template.id)}
            >
              <div className="template-preview">
                <div className="template-mock">
                  <div className="mock-header"></div>
                  <div className="mock-line"></div>
                  <div className="mock-line short"></div>
                </div>
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <small className="text-muted">{template.preview}</small>
              </div>
              {selectedTemplate === template.id && (
                <div className="template-selected">✓ Selected</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">No templates available</div>
      )}
    </div>
  );
}
