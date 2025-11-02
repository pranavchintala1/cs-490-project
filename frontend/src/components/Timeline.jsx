import React, { useEffect } from 'react';

const CareerTimeline = ({ careerData, title = "Career Timeline" }) => {
  // Default data if none provided
  const defaultData = {
    "TechCorp": ["2022-01", "Present"],
    "StartupXYZ": ["2020-03", "2021-12"],
    "WebAgency": ["2019-06", "2020-02"],
    "InternCorp": ["2018-09", "2019-05"]
  };

  const timelineData = careerData || defaultData;

  // Add CSS styles for custom scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .timeline-scrollbar::-webkit-scrollbar {
        width: 12px;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 6px;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-thumb {
        background: #9ca3af;
        border-radius: 6px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
        background-clip: content-box;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-button {
        display: block;
        height: 12px;
        background: #9ca3af;
        border-radius: 6px;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-button:hover {
        background: #6b7280;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-button:single-button:vertical:decrement {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M4 2L1 5h6z' fill='%23ffffff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
      }
      
      .timeline-scrollbar::-webkit-scrollbar-button:single-button:vertical:increment {
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M4 6L1 3h6z' fill='%23ffffff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to parse date strings and calculate duration
  const parseDate = (dateStr) => {
    if (dateStr === "Present" || dateStr === "Current") {
      return new Date();
    }
    // Handle different date formats
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1);
    }
    return new Date(dateStr);
  };

  const formatDate = (dateStr) => {
    if (dateStr === "Present" || dateStr === "Current") {
      return "Present";
    }
    const date = parseDate(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
      }
    }
  };

  // Check if data is empty
  if (!timelineData || Object.keys(timelineData).length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        padding: '10px',
        backgroundColor: '#E5E9EC',
        borderRadius: '6px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#4A4A4A',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          No Career Data Available
        </p>
      </div>
    );
  }

  // Convert to array and sort by start date (most recent first)
  const sortedEntries = Object.entries(timelineData).sort(([, [startA]], [, [startB]]) => {
    return parseDate(startB) - parseDate(startA);
  });

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        padding: '10px',
        backgroundColor: '#E5E9EC',
        borderRadius: '6px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#9ca3af transparent',
        margin: '20px 0'
      }}
      className="timeline-scrollbar"
    >
      {/* Timeline Title */}
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#0A0F1A',
        marginBottom: '16px',
        marginTop: '0',
        textAlign: 'center',
        borderBottom: '1px solid #D1D5DB',
        paddingBottom: '8px',
        flexShrink: 0,
      }}>
        {title}
      </h3>

      {/* Timeline Container */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        paddingRight: '2px',
        position: 'relative',
      }}>
        {/* Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '24px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: '#D1D5DB',
          zIndex: 1,
        }} />

        {/* Timeline Items */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          paddingLeft: '0',
          position: 'relative',
          zIndex: 2,
        }}>
          {sortedEntries.map(([company, [startDate, endDate]], index) => {
            const isPresent = endDate === "Present" || endDate === "Current";
            const duration = calculateDuration(startDate, endDate);

            return (
              <div key={company} style={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                paddingLeft: '50px',
                flexShrink: 0,
              }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: isPresent ? '#00A67A' : // Teal for current job
                                   index === 0 ? '#003366' : // Navy for most recent past job
                                   '#6366F1', // Purple for older jobs
                  border: '3px solid #E5E9EC',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 3,
                }} />

                {/* Job Details */}
                <div style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  {/* Company Name */}
                  <h4 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0A0F1A',
                    margin: '0 0 6px 0',
                    lineHeight: '1.3',
                  }}>
                    {company}
                  </h4>

                  {/* Date Range */}
                  <div style={{
                    fontSize: '11px',
                    color: '#4A4A4A',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </div>

                  {/* Duration */}
                  <div style={{
                    fontSize: '10px',
                    color: '#6B7280',
                    fontStyle: 'italic',
                  }}>
                    {duration}
                  </div>

                  {/* Current Job Indicator */}
                  {isPresent && (
                    <div style={{
                      marginTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      color: '#00A67A',
                      fontWeight: '600',
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#00A67A',
                      }} />
                      Current Position
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        paddingTop: '8px',
        borderTop: '1px solid #D1D5DB',
        fontSize: '10px',
        color: '#4A4A4A',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#00A67A', borderRadius: '50%' }} />
          <span>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#003366', borderRadius: '50%' }} />
          <span>Recent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#6366F1', borderRadius: '50%' }} />
          <span>Previous</span>
        </div>
      </div>
    </div>
  );
};

export default CareerTimeline;