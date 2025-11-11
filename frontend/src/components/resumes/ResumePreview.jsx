import React from 'react';
import '../../styles/resumes.css';

/**
 * ResumePreview Component
 * Displays formatted resume preview based on selected template
 * Supports three template types: Chronological, Functional, and Hybrid
 * Related to UC-046, UC-053
 */
export default function ResumePreview({ resume }) {
  if (!resume) {
    return <div className="resume-preview-empty">No resume data</div>;
  }

  const { contact, summary, experience, skills, education, colors, fonts, template } = resume;

  // Apply custom colors and fonts if provided
  const styles = {
    '--primary-color': colors?.primary || '#1a1a1a',
    '--accent-color': colors?.accent || '#2c3e50',
    '--heading-font': fonts?.heading || 'Calibri',
    '--body-font': fonts?.body || 'Calibri',
  };

  // Helper function to render contact information
  const renderContactInfo = () => (
    <>
      {contact && (
        <div className="resume-header">
          <h1 className="resume-name">{contact.name || 'Your Name'}</h1>
          <div className="contact-line">
            {contact.phone && <span>{contact.phone}</span>}
            {contact.phone && contact.email && <span className="separator">|</span>}
            {contact.email && <span>{contact.email}</span>}
            {contact.email && (contact.address || contact.location) && <span className="separator">|</span>}
            {(contact.address || contact.location) && <span>{contact.address || contact.location}</span>}
            {contact.linkedin && <span className="separator">|</span>}
            {contact.linkedin && <span>{contact.linkedin}</span>}
          </div>
        </div>
      )}
    </>
  );

  // Helper function to render experience section
  const renderExperience = () => (
    <>
      {experience && experience.length > 0 && (
        <div className="resume-section">
          <h2 className="section-heading">PROFESSIONAL EXPERIENCE</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="experience-entry">
              <div className="exp-header-row">
                <h3 className="job-title">{exp.position || 'Job Title'}</h3>
                <span className="date-range">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <div className="company-name">{exp.company || 'Company Name'}</div>
              <ul className="description-list">
                {exp.description && (
                  <li>{exp.description}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Helper function to render education section
  const renderEducation = () => (
    <>
      {education && education.length > 0 && (
        <div className="resume-section">
          <h2 className="section-heading">EDUCATION</h2>
          {education.map((edu) => (
            <div key={edu.id} className="education-entry">
              <div className="edu-header-row">
                <h3 className="degree">{edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}</h3>
                <span className="graduation-year">{edu.year || 'Year'}</span>
              </div>
              <div className="school-name">{edu.school || 'School Name'}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Helper function to render skills section
  const renderSkills = () => (
    <>
      {skills && skills.length > 0 && (
        <div className="resume-section">
          <h2 className="section-heading">SKILLS</h2>
          <div className="skills-content">
            {skills.map((skill, idx) => {
              // Handle both string and object formats
              const skillName = typeof skill === 'string' ? skill : (skill.name || '');
              return (
                <span key={idx} className="skill-item">
                  {skillName}{idx < skills.length - 1 ? ' • ' : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  // Helper function to render summary section
  const renderSummary = () => (
    <>
      {summary && (
        <div className="resume-section">
          <h2 className="section-heading">PROFESSIONAL SUMMARY</h2>
          <p className="summary-text">{summary}</p>
        </div>
      )}
    </>
  );

  // CHRONOLOGICAL TEMPLATE: Traditional format with experience first (current Harvard style)
  const renderChronological = () => (
    <>
      {renderContactInfo()}
      {renderSummary()}
      {renderExperience()}
      {renderEducation()}
      {renderSkills()}
    </>
  );

  // FUNCTIONAL TEMPLATE: Skills-focused, minimal experience listing
  const renderFunctional = () => (
    <>
      {renderContactInfo()}
      {renderSummary()}
      {renderSkills()}
      {renderExperience()}
      {renderEducation()}
    </>
  );

  // HYBRID TEMPLATE: Balance between skills and experience
  const renderHybrid = () => (
    <>
      {renderContactInfo()}
      {renderSummary()}
      <div className="resume-section-row">
        <div className="resume-section-left">
          {renderSkills()}
        </div>
      </div>
      {renderExperience()}
      {renderEducation()}
    </>
  );

  // Select which template to render
  const getTemplateContent = () => {
    switch (template?.toLowerCase()) {
      case 'functional':
        return renderFunctional();
      case 'hybrid':
        return renderHybrid();
      case 'chronological':
      default:
        return renderChronological();
    }
  };

  return (
    <div className="resume-preview-container">
      <div className="resume-preview" style={styles}>
        {getTemplateContent()}
      </div>
    </div>
  );
}
