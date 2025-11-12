import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumesAPI from '../../api/resumes';
import PDFAPI from '../../api/pdf';
import aiResumeAPI from '../../api/aiResumeAPI';
import ContactEditor from '../../components/resumes/ContactEditor';
import SummaryEditor from '../../components/resumes/SummaryEditor';
import ReorderSectionsEditor from '../../components/resumes/ReorderSectionsEditor';
import TemplateCustomizer from '../../components/resumes/TemplateCustomizer';
import ExperienceEditor from '../../components/resumes/ExperienceEditor';
import SkillsManager from '../../components/resumes/SkillsManager';
import SaveAsTemplateModal from '../../components/resumes/SaveAsTemplateModal';
import JobPostingSelector from '../../components/resumes/JobPostingSelector';
import AISuggestionPanel from '../../components/resumes/AISuggestionPanel';
import ResumePreview from '../../components/resumes/ResumePreview';
import '../../styles/resumes.css';

/**
 * ResumeEditor Component
 * Main editing interface for resumes with section customization
 * Related to UC-048, UC-050
 */
export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [contentWidth, setContentWidth] = useState(50); // Percentage width of content
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [previewTab, setPreviewTab] = useState('live'); // 'live' for HTML or 'pdf' for PDF

  // AI Feature States
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiFeatureType, setAiFeatureType] = useState(null); // 'content', 'skills', or 'experience'

  const layoutRef = useRef(null);
  const isResizing = useRef(false);
  const pdfTimeoutRef = useRef(null);

  // Fetch resume from backend
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ResumesAPI.get(id);
        let resumeData = response.data || response;

        // Transform backend field names to frontend field names
        if (resumeData.experience && Array.isArray(resumeData.experience)) {
          resumeData.experience = resumeData.experience.map((exp, index) => ({
            id: index + 1, // Generate frontend ID
            company: exp.company,
            position: exp.title, // Backend: title -> Frontend: position
            location: exp.location,
            startDate: exp.start_date, // Backend: start_date -> Frontend: startDate
            endDate: exp.end_date, // Backend: end_date -> Frontend: endDate
            description: exp.description,
            skills: [], // Frontend-only field
          }));
        }

        // Transform skills: if array of objects, convert to strings for display
        if (resumeData.skills && Array.isArray(resumeData.skills)) {
          resumeData.skills = resumeData.skills.map(skill =>
            typeof skill === 'string' ? skill : skill.name || ''
          );
        }

        setResume(resumeData);
      } catch (err) {
        setError(err.message || 'Failed to load resume');
        console.error('Error loading resume:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  // Handle divider drag start
  const handleDividerStart = () => {
    isResizing.current = true;
  };

  // Handle divider resize logic
  useEffect(() => {
    const handleResizeEnd = () => {
      isResizing.current = false;
    };

    const handleMouseMove = (e) => {
      if (!isResizing.current || !layoutRef.current) return;

      const container = layoutRef.current;
      const rect = container.getBoundingClientRect();
      const dividerX = e.clientX - rect.left;

      // Calculate percentage (between 30% and 70%)
      const percentage = (dividerX / rect.width) * 100;
      if (percentage >= 30 && percentage <= 70) {
        setContentWidth(percentage);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // PDF generation with debouncing (500ms after changes stop)
  useEffect(() => {
    if (!resume || !id) return;

    // Clear existing timeout
    if (pdfTimeoutRef.current) {
      clearTimeout(pdfTimeoutRef.current);
    }

    // Set new timeout for PDF generation
    pdfTimeoutRef.current = setTimeout(async () => {
      try {
        setPdfLoading(true);
        setPdfError(null);

        // Get the rendered HTML from the ResumePreview component
        const previewElement = document.querySelector('.resume-preview');
        if (!previewElement) {
          throw new Error('Resume preview not found');
        }

        const htmlContent = previewElement.outerHTML;

        const result = await PDFAPI.generatePreviewPDF(id, resume, htmlContent);

        if (result.success && result.pdf) {
          const blobUrl = PDFAPI.getPDFBlobURL(result.pdf);
          setPdfUrl(blobUrl);
        } else {
          setPdfError('Failed to generate PDF preview');
        }
      } catch (err) {
        console.error('PDF generation error:', err);
        // Extract meaningful error message from various error types
        let errorMsg = 'Failed to generate PDF preview';
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (typeof err === 'string') {
          errorMsg = err;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        setPdfError(errorMsg);
      } finally {
        setPdfLoading(false);
      }
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (pdfTimeoutRef.current) {
        clearTimeout(pdfTimeoutRef.current);
      }
    };
  }, [resume, id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Transform experience: rename frontend fields to backend field names
      const transformedExperience = (resume.experience || []).map(exp => ({
        company: exp.company,
        title: exp.position, // Frontend: position -> Backend: title
        location: exp.location,
        start_date: exp.startDate, // Frontend: startDate -> Backend: start_date
        end_date: exp.endDate, // Frontend: endDate -> Backend: end_date
        description: exp.description,
        // Remove frontend-only fields: id, skills
      }));

      // Transform skills: convert string array to objects with name property
      const transformedSkills = (resume.skills || []).map(skill =>
        typeof skill === 'string' ? { name: skill } : skill
      );

      // Only send fields that the backend expects, exclude _id, uuid, and timestamps
      const updateData = {
        name: resume.name,
        template: resume.template,
        contact: resume.contact,
        summary: resume.summary,
        experience: transformedExperience,
        education: resume.education,
        skills: transformedSkills,
        colors: resume.colors,
        fonts: resume.fonts,
        sections: resume.sections,
        default_resume: resume.default_resume,
      };
      await ResumesAPI.update(id, updateData);
      alert('Resume saved successfully!');
    } catch (err) {
      alert('Failed to save resume: ' + err.message);
      console.error('Error saving resume:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle opening job selector for AI features
  const handleOpenJobSelector = (featureType) => {
    setAiFeatureType(featureType);
    setShowJobSelector(true);
    setAiError(null);
  };

  // Handle job posting selection
  const handleJobPostingSelected = async (jobPosting) => {
    setSelectedJobPosting(jobPosting);
    setShowJobSelector(false);

    // Generate AI suggestions
    try {
      setAiLoading(true);
      setAiError(null);

      let result;
      switch (aiFeatureType) {
        case 'content':
          result = await aiResumeAPI.generateContent(id, jobPosting);
          break;
        case 'skills':
          result = await aiResumeAPI.optimizeSkills(id, jobPosting);
          break;
        case 'experience':
          result = await aiResumeAPI.tailorExperience(id, jobPosting);
          break;
        default:
          throw new Error('Invalid AI feature type');
      }

      setAiSuggestions(result);
    } catch (err) {
      setAiError(err.message || 'Failed to generate suggestions');
      console.error('AI generation error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle accepting AI suggestion
  const handleAcceptSuggestion = (suggestion) => {
    try {
      switch (aiFeatureType) {
        case 'content':
          if (suggestion.summary) {
            setResume({...resume, summary: suggestion.summary});
          }
          if (suggestion.experience_bullets) {
            // Add bullets to first experience entry
            if (resume.experience && resume.experience.length > 0) {
              const updatedExp = [...resume.experience];
              updatedExp[0] = {
                ...updatedExp[0],
                description: (updatedExp[0].description || '') + '\n' + suggestion.experience_bullets.join('\n'),
              };
              setResume({...resume, experience: updatedExp});
            }
          }
          if (suggestion.skills) {
            const newSkills = [...(resume.skills || []), ...suggestion.skills];
            setResume({...resume, skills: newSkills});
          }
          break;

        case 'skills':
          if (suggestion.skills_to_emphasize) {
            // Skills to emphasize should be moved to top
            const currentSkills = resume.skills || [];
            const emphasized = suggestion.skills_to_emphasize.filter(s => currentSkills.includes(s));
            const others = currentSkills.filter(s => !emphasized.includes(s));
            setResume({...resume, skills: [...emphasized, ...others]});
          }
          if (suggestion.recommended_skills) {
            const newSkills = [...(resume.skills || []), ...suggestion.recommended_skills];
            setResume({...resume, skills: newSkills});
          }
          break;

        case 'experience':
          if (suggestion.experience_index !== undefined && suggestion.new_description) {
            const updatedExp = [...resume.experience];
            updatedExp[suggestion.experience_index] = {
              ...updatedExp[suggestion.experience_index],
              description: suggestion.new_description,
            };
            setResume({...resume, experience: updatedExp});
          }
          break;

        default:
          break;
      }

      // Show confirmation
      alert('Suggestion accepted! Click Save to apply changes.');
    } catch (err) {
      console.error('Error accepting suggestion:', err);
      setAiError('Failed to apply suggestion');
    }
  };

  // Handle rejecting AI suggestion
  const handleRejectSuggestion = (item) => {
    console.log('Rejected:', item);
    // Could implement specific rejection logic here
  };

  // Close AI panel
  const handleCloseAiPanel = () => {
    setAiSuggestions(null);
    setAiFeatureType(null);
    setSelectedJobPosting(null);
  };

  if (loading) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Resume</h4>
          <p>{error}</p>
          <button onClick={() => navigate('/resumes')} className="btn btn-secondary">
            Back to Resumes
          </button>
        </div>
      </div>
    );
  }

  if (!resume) {
    return <div className="container mt-5"><h4>Resume not found</h4></div>;
  }

  return (
    <div className="resume-editor-container">
      <div className="resume-editor-header">
        <h1>Edit: {resume.name}</h1>
        <div className="editor-actions">
          {/* AI Buttons */}
          <div className="ai-buttons-group">
            <button
              onClick={() => handleOpenJobSelector('content')}
              className="btn btn-primary"
              title="Generate tailored content based on job posting"
            >
              ✨ Generate Content
            </button>
            <button
              onClick={() => handleOpenJobSelector('skills')}
              className="btn btn-primary"
              title="Optimize skills based on job requirements"
            >
              📊 Optimize Skills
            </button>
            <button
              onClick={() => handleOpenJobSelector('experience')}
              className="btn btn-primary"
              title="Tailor experience descriptions for specific job"
            >
              🎯 Tailor Experience
            </button>
          </div>

          {/* Standard Buttons */}
          <button onClick={handleSave} disabled={saving} className="btn btn-success">
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
          <button onClick={() => setShowSaveTemplateModal(true)} className="btn btn-info">
            Save as Template
          </button>
          <button onClick={() => navigate(`/resumes/export/${id}`)} className="btn btn-success">
            Export Resume
          </button>
          <button onClick={() => navigate('/resumes')} className="btn btn-secondary">
            Back to Resumes
          </button>
        </div>
      </div>

      <div className="resume-editor-layout" ref={layoutRef}>
        <div className="editor-sidebar">
          <ul className="nav nav-tabs flex-column">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'sections' ? 'active' : ''}`}
                onClick={() => setActiveTab('sections')}
              >
                Sections
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'experience' ? 'active' : ''}`}
                onClick={() => setActiveTab('experience')}
              >
                Experience
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                Skills
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'template' ? 'active' : ''}`}
                onClick={() => setActiveTab('template')}
              >
                Customize Template
              </button>
            </li>
          </ul>
        </div>

        <div
          className="editor-content"
          style={{ flex: `${contentWidth}%` }}
        >
          {activeTab === 'contact' && (
            <ContactEditor
              contact={resume.contact}
              onUpdate={(contact) => setResume({...resume, contact})}
            />
          )}
          {activeTab === 'summary' && (
            <SummaryEditor
              summary={resume.summary}
              onUpdate={(summary) => setResume({...resume, summary})}
            />
          )}
          {activeTab === 'sections' && (
            <ReorderSectionsEditor
              sections={resume.sections}
              onUpdate={(sections) => setResume({...resume, sections})}
            />
          )}
          {activeTab === 'experience' && (
            <ExperienceEditor
              experience={resume.experience}
              onUpdate={(experience) => setResume({...resume, experience})}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsManager
              skills={resume.skills}
              onUpdate={(skills) => setResume({...resume, skills})}
            />
          )}
          {activeTab === 'template' && (
            <TemplateCustomizer
              colors={resume.colors}
              fonts={resume.fonts}
              onUpdate={(colors, fonts) => setResume({...resume, colors, fonts})}
            />
          )}
        </div>

        {/* Resizable Divider */}
        <div
          className="editor-divider"
          onMouseDown={handleDividerStart}
          title="Drag to resize editor and preview"
        />

        <div
          className="editor-preview"
          style={{ flex: `${100 - contentWidth}%` }}
        >
          <div className="preview-header-bar">
            <h3>Preview</h3>
            {/* Preview Tab Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${previewTab === 'live' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPreviewTab('live')}
              >
                Live Preview
              </button>
              <button
                className={`btn btn-sm ${previewTab === 'pdf' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPreviewTab('pdf')}
              >
                PDF Preview
              </button>
            </div>
            {previewTab === 'pdf' && pdfLoading && <span className="badge bg-info">Generating...</span>}
            {previewTab === 'pdf' && pdfError && <span className="badge bg-danger">Error</span>}
          </div>

          {previewTab === 'pdf' && pdfError && (
            <div className="alert alert-warning m-3 mb-0" role="alert">
              <small>
                <strong>Preview Error:</strong> {pdfError}
              </small>
            </div>
          )}

          <div className="editor-preview-container">
            {previewTab === 'live' ? (
              // LIVE HTML PREVIEW with template styling
              resume ? (
                <ResumePreview
                  resume={resume}
                  onSectionReorder={(sections) => setResume({ ...resume, sections })}
                />
              ) : (
                <div className="pdf-loading-spinner">
                  <p className="text-muted">Loading resume...</p>
                </div>
              )
            ) : (
              // PDF PREVIEW
              pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="Resume PDF Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '6px',
                  }}
                />
              ) : pdfLoading ? (
                <div className="pdf-loading-spinner">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading PDF...</span>
                  </div>
                  <p className="text-muted mt-3">Generating your resume...</p>
                </div>
              ) : (
                <div className="pdf-loading-spinner">
                  <p className="text-muted">PDF preview will appear here</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <SaveAsTemplateModal
          resumeId={id}
          resumeName={resume?.name}
          onClose={() => setShowSaveTemplateModal(false)}
          onSuccess={() => {
            setShowSaveTemplateModal(false);
            alert('Template saved successfully!');
          }}
        />
      )}

      {/* Job Posting Selector Modal */}
      {showJobSelector && (
        <JobPostingSelector
          onSelect={handleJobPostingSelected}
          onClose={() => setShowJobSelector(false)}
        />
      )}

      {/* AI Suggestion Panel */}
      {aiSuggestions && aiFeatureType && (
        <AISuggestionPanel
          type={aiFeatureType}
          suggestions={aiSuggestions}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
          onClose={handleCloseAiPanel}
          loading={aiLoading}
          experienceCount={resume?.experience?.length || 0}
        />
      )}

      {/* AI Error Notification */}
      {aiError && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #f5c6cb',
          maxWidth: '400px',
          zIndex: 999,
        }}>
          <strong>Error:</strong> {aiError}
          <button
            onClick={() => setAiError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              float: 'right',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
