import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumePreview from '../../components/resumes/ResumePreview';
import ValidationFeedback from '../../components/resumes/ValidationFeedback';
import '../../styles/resumes.css';

/**
 * ResumePreviewPage Component
 * Full-screen preview of resume with validation feedback
 * Related to UC-053
 */
export default function ResumePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [showValidation, setShowValidation] = useState(true);

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

  if (!resume) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
  }

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
        </div>
      </div>

      <div className="preview-layout">
        <div className="preview-main">
          <ResumePreview resume={resume} />
        </div>

        {showValidation && (
          <div className="preview-validation">
            <ValidationFeedback resume={resume} />
          </div>
        )}
      </div>
    </div>
  );
}
