import React from 'react';

const ProgressTracker = ({ data }) => {
  // Check which cards have data
  const cardStatus = {
    profile: data.profile && data.profile.length > 0,
    employmentHistory: data.employmentHistory && data.employmentHistory.length > 0,
    skills: data.skills && data.skills.length > 0,
    education: data.education && data.education.length > 0,
    projects: data.projects && data.projects.length > 0
  };

  // Count completed cards
  const completedCards = Object.values(cardStatus).filter(Boolean).length;
  const totalCards = Object.keys(cardStatus).length;
  const completionPercentage = (completedCards / totalCards) * 100;

  // Tips for each category
  const tips = {
    profile: [
      "Add your personal information and contact details",
      "Include a professional summary or bio",
      "Upload a professional photo"
    ],
    employmentHistory: [
      "List your current and previous job positions",
      "Include company names and employment dates",
      "Add key achievements and responsibilities"
    ],
    skills: [
      "List your technical skills and programming languages",
      "Include soft skills and certifications",
      "Rate your proficiency levels"
    ],
    education: [
      "Add your degrees and educational institutions",
      "Include relevant certifications and courses",
      "List academic achievements and honors"
    ],
    projects: [
      "Showcase your best work and portfolio projects",
      "Include project descriptions and technologies used",
      "Add links to live demos or repositories"
    ]
  };

  // Get cards that need completion
  const incompleteCards = Object.entries(cardStatus)
    .filter(([_, isComplete]) => !isComplete)
    .map(([cardName, _]) => cardName);

  return (
    <div style={{
      backgroundColor: '#F9FAFC', // Background Light
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #D1D5DB',
      margin: '20px 0',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#003366', // Primary Blue
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        Profile Completion
      </h3>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: '#E5E9EC', // Soft Gray
        borderRadius: '10px',
        height: '20px',
        marginBottom: '15px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#00A67A', // Teal Green
          height: '100%',
          width: `${completionPercentage}%`,
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      <p style={{
        textAlign: 'center',
        color: '#4A4A4A', // Text Secondary
        fontSize: '14px',
        marginBottom: '20px'
      }}>
        {completedCards} of {totalCards} sections completed ({Math.round(completionPercentage)}%)
      </p>

      {/* Completion Status */}
      {completedCards === totalCards ? (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#1DB954', // Success Green background
          color: '#FFFFFF',
          borderRadius: '8px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🎉 Congratulations! Your profile is complete!
          </p>
          <p style={{
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>
            All sections have been filled out. Your profile looks great!
          </p>
        </div>
      ) : (
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0A0F1A', // Text Primary
            marginBottom: '10px'
          }}>
            Complete these sections:
          </h4>
          
          {incompleteCards.map((cardName) => (
            <div key={cardName} style={{
              backgroundColor: '#FFFFFF', // Surface White
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              marginBottom: '10px'
            }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '6px',
                textTransform: 'capitalize'
              }}>
                {cardName.replace(/([A-Z])/g, ' $1').trim()}
              </h5>
              <ul style={{
                margin: 0,
                paddingLeft: '15px',
                color: '#4A4A4A' // Text Secondary
              }}>
                {tips[cardName].map((tip, index) => (
                  <li key={index} style={{
                    fontSize: '12px',
                    marginBottom: '2px'
                  }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;