import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('sections');
  const [saving, setSaving] = useState(false);
  const [contentWidth, setContentWidth] = useState(50); // Percentage width of content
  const layoutRef = useRef(null);
  const isResizing = useRef(false);

  // TODO: Replace with API call when backend is ready
  useEffect(() => {
    // Mock resume data with professional details
    const mockResume = {
      id: id || 1,
      name: 'Software Engineer Resume',
      template: 'chronological',
      sections: ['contact', 'summary', 'experience', 'education', 'skills'],
      contact: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johnsmith',
      },
      summary: 'Results-driven Senior Software Engineer with 5+ years of experience designing and implementing scalable cloud-based solutions. Proven expertise in full-stack development, microservices architecture, and leading cross-functional teams. Passionate about writing clean, maintainable code and mentoring junior developers.',
      experience: [
        {
          id: 1,
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: 'present',
          description: 'Led development of microservices architecture supporting 2M+ daily active users. Architected and implemented real-time data processing pipeline using Node.js and AWS Lambda, reducing latency by 40%. Mentored team of 4 junior developers and conducted code reviews to maintain code quality standards.',
          skills: ['React', 'Node.js', 'AWS', 'Docker'],
        },
        {
          id: 2,
          company: 'StartUp Inc',
          position: 'Full Stack Developer',
          startDate: '2020-06',
          endDate: '2022-01',
          description: 'Developed and deployed 15+ full-stack web applications using React and Python. Optimized database queries resulting in 35% improvement in API response times. Implemented CI/CD pipelines using GitHub Actions, reducing deployment time from 30 minutes to 5 minutes.',
          skills: ['JavaScript', 'Python', 'PostgreSQL', 'React'],
        },
        {
          id: 3,
          company: 'Digital Agency',
          position: 'Junior Frontend Developer',
          startDate: '2019-07',
          endDate: '2020-06',
          description: 'Built responsive web interfaces for 20+ client projects using HTML5, CSS3, and JavaScript. Collaborated with UX designers and backend developers to deliver pixel-perfect implementations. Increased code test coverage from 45% to 85% through comprehensive unit testing.',
          skills: ['HTML5', 'CSS3', 'JavaScript', 'React'],
        },
      ],
      education: [
        {
          id: 1,
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          year: '2019',
        },
        {
          id: 2,
          school: 'AWS Certification',
          degree: 'AWS Certified Solutions Architect',
          field: 'Professional',
          year: '2022',
        },
      ],
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'JavaScript', 'TypeScript', 'Git', 'Agile/Scrum'],
      colors: { primary: '#1a1a1a', accent: '#2c3e50' },
      fonts: { heading: 'Calibri', body: 'Calibri' },
    };
    setResume(mockResume);
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
    setSaving(true);
    // TODO: Replace with actual API call when backend is ready
    console.log('Saving resume:', resume);
    setTimeout(() => {
      setSaving(false);
      alert('Resume saved successfully!');
    }, 500);
  };

  const handleFullPrintView = () => {
    setContentWidth(25);
  };

  if (!resume) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
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
