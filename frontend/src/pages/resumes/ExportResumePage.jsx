import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExportOptions from '../../components/resumes/ExportOptions';
import '../../styles/resumes.css';

/**
 * ExportResumePage Component
 * Export resume in multiple formats (PDF, DOCX, HTML, TXT)
 * Related to UC-051
 */
export default function ExportResumePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [theme, setTheme] = useState('professional');
  const [exporting, setExporting] = useState(false);
  const [filename, setFilename] = useState('');

  // TODO: Replace with API call when backend is ready
  useEffect(() => {
    const mockResume = {
      id: id,
      name: 'Software Engineer Resume',
    };
    setResume(mockResume);
    setFilename(mockResume.name.replace(/\s+/g, '_'));
  }, [id]);

  const exportFormats = [
    { id: 'pdf', label: 'PDF', extension: 'pdf', description: 'Universal format with professional formatting' },
    { id: 'docx', label: 'Word Document', extension: 'docx', description: 'Editable Microsoft Word format' },
    { id: 'html', label: 'HTML', extension: 'html', description: 'Web-friendly format' },
    { id: 'txt', label: 'Plain Text', extension: 'txt', description: 'For ATS systems' },
  ];

  const themes = [
    { id: 'professional', label: 'Professional', description: 'Clean and traditional' },
    { id: 'modern', label: 'Modern', description: 'Contemporary design' },
    { id: 'minimal', label: 'Minimal', description: 'Minimalist style' },
    { id: 'creative', label: 'Creative', description: 'Bold and colorful' },
  ];

  const handleExport = async () => {
    setExporting(true);
    // TODO: Replace with actual API call when backend is ready
    console.log('Exporting resume:', {
      resumeId: id,
      format: selectedFormat,
      theme: theme,
      filename: filename,
    });

    setTimeout(() => {
      setExporting(false);
      alert(`Resume exported as ${selectedFormat.toUpperCase()}!\nFile: ${filename}.${selectedFormat}`);
      // In real implementation, this would trigger a download
    }, 1000);
  };

  if (!resume) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
  }

  return (
    <div className="container mt-5">
      <div className="export-header">
        <h1>Export Resume</h1>
        <button onClick={() => navigate(`/resumes/edit/${id}`)} className="btn btn-secondary">
          Back
        </button>
      </div>

      <div className="export-layout">
        <div className="export-options">
          <h3>Choose Format</h3>
          <ExportOptions
            formats={exportFormats}
            selectedFormat={selectedFormat}
            onSelect={setSelectedFormat}
          />
        </div>

        <div className="theme-options">
          <h3>Choose Theme</h3>
          <div className="theme-grid">
            {themes.map((t) => (
              <div
                key={t.id}
                className={`theme-card ${theme === t.id ? 'selected' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <h4>{t.label}</h4>
                <p>{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="export-settings">
          <h3>Settings</h3>
          <div className="form-group mb-3">
            <label className="form-label">Filename</label>
            <input
              type="text"
              className="form-control"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
            <small className="form-text text-muted">
              File will be saved as: {filename}.{selectedFormat}
            </small>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="addWatermark"
              className="form-check-input"
              defaultChecked={false}
            />
            <label className="form-check-label" htmlFor="addWatermark">
              Add watermark / Branding
            </label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="printOptimized"
              className="form-check-input"
              defaultChecked={true}
            />
            <label className="form-check-label" htmlFor="printOptimized">
              Print-optimized version
            </label>
          </div>
        </div>

        <div className="export-actions mt-4">
          <button
            onClick={handleExport}
            disabled={exporting || !filename.trim()}
            className="btn btn-primary btn-lg"
          >
            {exporting ? 'Exporting...' : `Download as ${selectedFormat.toUpperCase()}`}
          </button>
          <button onClick={() => navigate('/resumes')} className="btn btn-secondary btn-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
