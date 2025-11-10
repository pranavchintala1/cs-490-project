import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumesAPI from '../../api/resumes';
import ResumePreview from '../../components/resumes/ResumePreview';
import SectionCustomizer from '../../components/resumes/SectionCustomizer';
import TemplateCustomizer from '../../components/resumes/TemplateCustomizer';
import ExperienceEditor from '../../components/resumes/ExperienceEditor';
import SkillsManager from '../../components/resumes/SkillsManager';
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
  const [activeTab, setActiveTab] = useState('sections');
  const [saving, setSaving] = useState(false);
  const [contentWidth, setContentWidth] = useState(50); // Percentage width of content
  const layoutRef = useRef(null);
  const isResizing = useRef(false);

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

  const handleFullPrintView = () => {
    setContentWidth(25);
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
          <button onClick={handleSave} disabled={saving} className="btn btn-success">
            {saving ? 'Saving...' : 'Save Resume'}
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
          {activeTab === 'sections' && (
            <SectionCustomizer
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
            <h3>Live Preview</h3>
            <button onClick={handleFullPrintView} className="btn btn-sm btn-outline-primary">
              Full Print View
            </button>
          </div>
          <div className="editor-preview-container">
            <div className="editor-preview-document">
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
