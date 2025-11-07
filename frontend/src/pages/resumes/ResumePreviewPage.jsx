import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumePreview from '../../components/resumes/ResumePreview';
import ValidationFeedback from '../../components/resumes/ValidationFeedback';
import '../../styles/resumes.css';

/**
 * ResumePreviewPage Component
 * Full-screen preview of resume with validation feedback
 * Resizable print layout preview (8.5" x 11" aspect ratio)
 * Related to UC-053
 */
export default function ResumePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [showValidation, setShowValidation] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(800); // Default width in pixels
  const previewContainerRef = useRef(null);
  const isResizing = useRef(false);

  // TODO: Replace with API call when backend is ready
  useEffect(() => {
    const mockResume = {
      id: id,
      name: 'Software Engineer Resume',
      template: 'chronological',
      contact: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johnsmith',
      },
      summary: 'Results-driven Senior Software Engineer with 5+ years of experience designing and implementing scalable cloud-based solutions. Proven expertise in full-stack development, microservices architecture, and leading cross-functional teams.',
      experience: [
        {
          id: 1,
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: 'present',
          description: 'Led development of microservices architecture supporting 2M+ daily active users. Architected and implemented real-time data processing pipeline using Node.js and AWS Lambda, reducing latency by 40%.',
        },
        {
          id: 2,
          company: 'StartUp Inc',
          position: 'Full Stack Developer',
          startDate: '2020-06',
          endDate: '2022-01',
          description: 'Developed and deployed 15+ full-stack web applications using React and Python. Optimized database queries resulting in 35% improvement in API response times.',
        },
      ],
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'JavaScript', 'TypeScript'],
      education: [
        {
          id: 1,
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          year: '2019',
        },
      ],
    };
    setResume(mockResume);
  }, [id]);

  // Handle resize start
  const handleResizeStart = () => {
    isResizing.current = true;
  };

  // Handle resize end
  useEffect(() => {
    const handleResizeEnd = () => {
      isResizing.current = false;
    };

    const handleMouseMove = (e) => {
      if (!isResizing.current || !previewContainerRef.current) return;

      const container = previewContainerRef.current;
      const rect = container.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;

      // Constrain width between 400px and 1200px
      if (newWidth >= 400 && newWidth <= 1200) {
        setPreviewWidth(newWidth);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  if (!resume) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
  }

  // Calculate height based on 8.5" x 11" aspect ratio (1:1.294)
  const aspectRatio = 1.294;
  const previewHeight = previewWidth * aspectRatio;

  return (
    <div className="resume-preview-page">
      <div className="preview-header">
        <h1>{resume.name}</h1>
        <div className="preview-actions">
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="btn btn-secondary"
          >
            {showValidation ? 'Hide' : 'Show'} Validation
          </button>
          <button onClick={() => navigate(`/resumes/edit/${id}`)} className="btn btn-primary">
            Edit Resume
          </button>
          <button onClick={() => navigate('/resumes')} className="btn btn-secondary">
            Back
          </button>
          <span className="preview-size-info">
            Size: {Math.round(previewWidth)}px × {Math.round(previewHeight)}px (drag corner to resize)
          </span>
        </div>
      </div>

      <div className="preview-layout" style={{ gap: '20px' }}>
        <div
          className="preview-main-resizable"
          ref={previewContainerRef}
          style={{
            width: `${previewWidth}px`,
            position: 'relative'
          }}
        >
          <div style={{ overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <ResumePreview resume={resume} />
          </div>

          {/* Resize Handle - Bottom Right Corner */}
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              bottom: '-12px',
              right: '-12px',
              width: '24px',
              height: '24px',
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 50%, #4a90e2 50%)',
              borderRadius: '0 0 8px 0',
              zIndex: 100,
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => !isResizing.current && (e.currentTarget.style.opacity = '0.6')}
            title="Drag to resize preview"
          />
        </div>

        {showValidation && (
          <div className="preview-validation" style={{ minWidth: '300px' }}>
            <ValidationFeedback resume={resume} />
          </div>
        )}
      </div>
    </div>
  );
}
