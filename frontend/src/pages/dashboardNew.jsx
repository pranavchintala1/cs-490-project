import React, { useState, useEffect } from 'react';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import BarChart from '../components/BarChart';
import { apiRequest } from "../api";
import CareerTimeline from '../components/Timeline';

// const fetchDataFromAPI = async (endpoint, headerKey) => {
//   const apidata = await apiRequest(endpoint);

//   function transformData(data, titleKey = "title") {
//     return data.map(obj => {
//       const cleaned = Object.fromEntries(
//         Object.entries(obj).filter(([_, value]) => value != null)
//       );
//       if (Object.keys(cleaned).length === 0) return [];

//       const title = cleaned[titleKey] ?? "(no title)";
//       const otherValues = Object.entries(cleaned)
//         .filter(([key]) => key !== titleKey)
//         .map(([_, value]) => value);

//       if (otherValues.length === 0 && !cleaned[titleKey]) return [];
//       return [title, otherValues];
//     }).filter(item => item.length > 0);
//   }

//   const formatted = transformData(apidata, headerKey);
//   return formatted;
// };




//////////////////////DEPRECATED
const fetchDataFromAPI = async (endpoint, name) => { //TODO update with actual api and enpoints
  // // Simulate network delay
  // await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 500));
  
  // // Generate mock data based on endpoint
  const mockData = {
    'api/users/me': [
      ["Personal Information", ["John Smith", "Software Engineer", "New York, NY"]],
      ["Contact Details", ["john.smith@email.com", "+1 (555) 123-4567", "LinkedIn: /in/johnsmith"]],
      ["Summary", ["5+ years experience", "Full-stack developer", "Team leader"]]
    ],
    'api/employment/me': [
      ["Current Position", ["Senior Developer at TechCorp", "2022 - Present", "Led team of 4 developers"]],
      ["Previous Roles", ["Developer at StartupXYZ", "2020 - 2022", "Built scalable web applications"]],
      ["Early Career", ["Junior Developer at WebAgency", "2019 - 2020", "Frontend development"]]
    ],
    'api/skills/me': [
      ["Programming Languages", ["JavaScript", "Python", "Java", "TypeScript"]],
      ["Frameworks & Libraries", ["React", "Node.js", "Express", "Django"]],
      ["Tools & Technologies", ["Git", "Docker", "AWS", "MongoDB"]]
    ],
    'api/education/me': [
      ["Degrees", ["Bachelor of Computer Science", "University of Technology", "2015 - 2019"]],
      ["Certifications", ["AWS Certified Developer", "React Developer Certification", "Agile Project Management"]],
      ["Additional Learning", ["Online Courses", "Technical Workshops", "Conference Attendance"]]
    ],
    'api/projects/me': [
      ["Web Applications", ["E-commerce Platform", "Task Management System", "Social Media Dashboard"]],
      ["Mobile Apps", ["Budget Tracker", "Fitness App", "Recipe Finder"]],
      ["Open Source", ["JavaScript Library", "Documentation Site", "Code Utilities"]]
    ]

  // // const mockData = {
  // //   'api/users/me': [],
  // //   'api/employment/me': [
  // //     ["Current Position", ["Senior Developer at TechCorp", "2022 - Present", "Led team of 4 developers"]],
  // //     ["Previous Roles", ["Developer at StartupXYZ", "2020 - 2022", "Built scalable web applications"]],
  // //     ["Early Career", ["Junior Developer at WebAgency", "2019 - 2020", "Frontend development"]]
  // //   ],
  // //   'api/skills/me': [],
  // //   'api/education/me': [
  // //     ["Degrees", ["Bachelor of Computer Science", "University of Technology", "2015 - 2019"]],
  // //     ["Certifications", ["AWS Certified Developer", "React Developer Certification", "Agile Project Management"]],
  // //     ["Additional Learning", ["Online Courses", "Technical Workshops", "Conference Attendance"]]
  // //   ],
  // //   'api/projects/me': []
  };
  
  return mockData[endpoint] || [];
};
//////////////////////DEPRECATED







const Dashboard = () => {
    const [data, setData] = useState({
        profile: null,
        employmentHistory: null,
        skills: null,
        education: null,
        projects: null
      });
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
    
      useEffect(() => {
        const fetchAllData = async () => {
          try {
            setLoading(true);
            
            // Make 5 parallel API requests
            const [profileData, employmentData, skillsData, educationData, projectsData] = await Promise.all([
              fetchDataFromAPI('/api/users/me',"username"),
              fetchDataFromAPI('/api/employment/me',"title"),
              fetchDataFromAPI('/api/skills/me',"name"),
              fetchDataFromAPI('/api/education/me',"institution_name"),
              fetchDataFromAPI('/api/projects/me',"project-name")
            ]);
    
            // Store results in state
            setData({
              profile: profileData,
              employmentHistory: employmentData,
              skills: skillsData,
              education: educationData,
              projects: projectsData
            });
          } catch (err) {
            setError('Failed to fetch data');
            console.error('API Error:', err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAllData();
      }, []);
    
      if (loading) {
        return (
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(90deg, #003366, #00A67A)', // Emerald Gradient
            padding: '20px'
          }}>
            <div style={{ width: '100%' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#FFFFFF', // White text on gradient
                marginBottom: '40px'
              }}>
                Dashboard
              </h1>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                flexDirection: 'column'
              }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '10px'
                }}>⏳</div>
                <div style={{ 
                  fontSize: '18px', 
                  color: '#FFFFFF' // White text on gradient
                }}>
                  Loading dashboard data...
                </div>
              </div>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(90deg, #003366, #00A67A)', // Emerald Gradient
            padding: '20px'
          }}>
            <div style={{ width: '100%' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#FFFFFF', // White text on gradient
                marginBottom: '40px'
              }}>
                Dashboard
              </h1>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF', // Surface White for error container
                  color: '#E53935', // Error Red
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E53935', // Error Red border
                  fontSize: '18px'
                }}>
                  ⚠️ {error}
                </div>
              </div>
            </div>
          </div>
        );
      }

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: '#001E3C',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#FFFFFF',
            marginBottom: '40px',
          }}
        >
          Dashboard
        </h1>

        {/* Main grid layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '4fr 1fr', // left wide, right narrow
            gap: '20px',
            width: '100%',
          }}
        >
          {/* Left side: 3x2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // 2 columns
              gap: '20px',
            }}
          >
            {['Profile', 'Employment History', 'Skills', 'Education', 'Projects', 'Certifications'].map((title, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#F9FAFC',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  boxSizing: 'border-box',
                  height: '400px', // fixed height for each box
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <a 
                  href={`/${title.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#003366', // Primary Blue
                    marginBottom: '12px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
                  onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
                >
                  {title}
                </a>
                <div
                  style={{
                    flex: 1, // Take remaining space
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent',
                  }}
                >
                  <CategoryCard index={i} />
                </div>
              </div>
            ))}
          </div>

          {/* Right side: 2 stacked sticky boxes */}
          <div
            style={{
              position: 'sticky',
              top: '20px', // stick 20px from top of viewport
              alignSelf: 'start',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: 'calc(100vh - 40px)', // full screen height minus padding
            }}
          >
            {/* Top Right Box */}
            <div
              style={{
                backgroundColor: '#F9FAFC',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                boxSizing: 'border-box',
                flex: 1, // half of sticky column height
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Allow flex child to shrink below content size
                overflow: 'hidden', // Ensure container doesn't expand beyond bounds
              }}
            >
              <a 
                href="/skills"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#003366',
                  marginBottom: '12px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                  cursor: 'pointer',
                  flexShrink: 0, // Prevent title from shrinking
                }}
                onMouseOver={(e) => e.target.style.color = '#00A67A'}
                onMouseOut={(e) => e.target.style.color = '#003366'}
              >
                Skills Overview
              </a>
              <div 
                style={{ 
                  flex: 1,
                  minHeight: 0, // Allow this container to shrink below its content
                  overflow: 'hidden', // Ensure the chart doesn't overflow this container
                }}
              >
                <BarChart 
                  data={{
                    "JavaScript": 85,
                    "Python": 70,
                    "React": 90,
                    "Node.js": 65,
                    "CSS": 80,
                    "HTML": 95,
                    "TypeScript": 60,
                    "Docker": 45,
                    "Docker2": 45,
                    "Docker3": 45,
                    "Docker4": 45,
                    "Docker5": 45,
                    "AWS": 55,
                    "MongoDB": 50
                  }}
                  title="Skills Proficiency"
                />
              </div>
            </div>

            {/* Bottom Right Box */}
            <div
              style={{
                backgroundColor: '#F9FAFC',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                boxSizing: 'border-box',
                flex: 1, // second half
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <a 
                href="/quick-actions"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#003366',
                  marginBottom: '12px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.color = '#00A67A'}
                onMouseOut={(e) => e.target.style.color = '#003366'}
              >
                Quick Actions
              </a>
              <div
                style={{
                  backgroundColor: '#E5E9EC',
                  padding: '10px',
                  borderRadius: '8px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #D1D5DB',
                }}
              >
                <span
                  style={{
                    color: '#003366',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Action Menu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Progress Tracker */}
        {/* <ProgressTracker data={data} /> */}
        <CareerTimeline 
            // careerData={myCareerData} 
            title="My Career Journey"
          />
    </div>
  );
};

export default Dashboard;