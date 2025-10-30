import React, { useState, useEffect } from 'react';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import { apiRequest } from "../api";

// Simulate API calls to a generic database
const fetchDataFromAPI = async (endpoint, name) => { //TODO update with actual api and enpoints
  // // Simulate network delay
  // await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 500));
  
  // // Generate mock data based on endpoint
  // const mockData = {
  //   'api/users/me': [
  //     ["Personal Information", ["John Smith", "Software Engineer", "New York, NY"]],
  //     ["Contact Details", ["john.smith@email.com", "+1 (555) 123-4567", "LinkedIn: /in/johnsmith"]],
  //     ["Summary", ["5+ years experience", "Full-stack developer", "Team leader"]]
  //   ],
  //   'api/employment/me': [
  //     ["Current Position", ["Senior Developer at TechCorp", "2022 - Present", "Led team of 4 developers"]],
  //     ["Previous Roles", ["Developer at StartupXYZ", "2020 - 2022", "Built scalable web applications"]],
  //     ["Early Career", ["Junior Developer at WebAgency", "2019 - 2020", "Frontend development"]]
  //   ],
  //   'api/skills/me': [
  //     ["Programming Languages", ["JavaScript", "Python", "Java", "TypeScript"]],
  //     ["Frameworks & Libraries", ["React", "Node.js", "Express", "Django"]],
  //     ["Tools & Technologies", ["Git", "Docker", "AWS", "MongoDB"]]
  //   ],
  //   'api/education/me': [
  //     ["Degrees", ["Bachelor of Computer Science", "University of Technology", "2015 - 2019"]],
  //     ["Certifications", ["AWS Certified Developer", "React Developer Certification", "Agile Project Management"]],
  //     ["Additional Learning", ["Online Courses", "Technical Workshops", "Conference Attendance"]]
  //   ],
  //   'api/projects/me': [
  //     ["Web Applications", ["E-commerce Platform", "Task Management System", "Social Media Dashboard"]],
  //     ["Mobile Apps", ["Budget Tracker", "Fitness App", "Recipe Finder"]],
  //     ["Open Source", ["JavaScript Library", "Documentation Site", "Code Utilities"]]
  //   ]

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
  // };
  
  // return mockData[endpoint] || [];



  ///////COMMENT BREAK COMMENT BREAK

  // const apidata = await apiRequest(endpoint);

  // function transformData(data, titleKey = "title") {
  //   return data.map(obj => {
  //     const title = obj[titleKey];
  //     const otherValues = Object.entries(obj)
  //       .filter(([key]) => key !== titleKey)
  //       .map(([_, value]) => value);
  //     return [title, otherValues];
  //   });
  // }
  // const formatted=transformData(apidata,name)
  
  // return formatted;

};

// Dashboard component
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
          fetchDataFromAPI('/api/users/me',"profile-name"),
          fetchDataFromAPI('/api/employment/me',"job-name"),
          fetchDataFromAPI('/api/skills/me',"skill-name"),
          fetchDataFromAPI('/api/education/me',"ed-name"),
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#001E3C', // Deep Navy for main background
      padding: '20px'
    }}>
      <div style={{ width: '100%' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#FFFFFF', // White text on dark background
          marginBottom: '40px'
        }}>
          Dashboard
        </h1>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          width: '100%',
          justifyContent: 'flex-start'
        }}>
          <div style={{
            backgroundColor: '#F9FAFC', // Background Light for section containers
            padding: '18px', // Slightly increased padding to give cards breathing room
            borderRadius: '12px',
            border: '1px solid #D1D5DB',
            flex: '1 1 calc(33.333% - 14px)', // Accounts for gap
            minWidth: '300px'
          }}>
            <a 
              href="/profile" 
              style={{
                fontSize: '18px', // Slightly reduced from 20px
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '12px', // Increased margin for better spacing
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
              onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
            >
              Profile
            </a>
            <CategoryCard data={data.profile} />
          </div>
          
          <div style={{
            backgroundColor: '#F9FAFC', // Background Light for section containers
            padding: '18px', // Slightly increased padding to give cards breathing room
            borderRadius: '12px',
            border: '1px solid #D1D5DB',
            flex: '1 1 calc(33.333% - 14px)', // Accounts for gap
            minWidth: '300px'
          }}>
            <a 
              href="/employment-history" 
              style={{
                fontSize: '18px', // Slightly reduced from 20px
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '12px', // Increased margin for better spacing
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
              onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
            >
              Employment History
            </a>
            <CategoryCard data={data.employmentHistory} />
          </div>
          
          <div style={{
            backgroundColor: '#F9FAFC', // Background Light for section containers
            padding: '18px', // Slightly increased padding to give cards breathing room
            borderRadius: '12px',
            border: '1px solid #D1D5DB',
            flex: '1 1 calc(33.333% - 14px)', // Accounts for gap
            minWidth: '300px'
          }}>
            <a 
              href="/skills" 
              style={{
                fontSize: '18px', // Slightly reduced from 20px
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '12px', // Increased margin for better spacing
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
              onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
            >
              Skills
            </a>
            <CategoryCard data={data.skills} />
          </div>
          
          <div style={{
            backgroundColor: '#F9FAFC', // Background Light for section containers
            padding: '18px', // Slightly increased padding to give cards breathing room
            borderRadius: '12px',
            border: '1px solid #D1D5DB',
            flex: '1 1 calc(33.333% - 14px)', // Accounts for gap
            minWidth: '300px'
          }}>
            <a 
              href="/education" 
              style={{
                fontSize: '18px', // Slightly reduced from 20px
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '12px', // Increased margin for better spacing
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
              onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
            >
              Education
            </a>
            <CategoryCard data={data.education} />
          </div>
          
          <div style={{
            backgroundColor: '#F9FAFC', // Background Light for section containers
            padding: '18px', // Slightly increased padding to give cards breathing room
            borderRadius: '12px',
            border: '1px solid #D1D5DB',
            flex: '1 1 calc(33.333% - 14px)', // Accounts for gap
            minWidth: '300px'
          }}>
            <a 
              href="/projects" 
              style={{
                fontSize: '18px', // Slightly reduced from 20px
                fontWeight: '600',
                color: '#003366', // Primary Blue
                marginBottom: '12px', // Increased margin for better spacing
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#00A67A'} // Teal Green on hover
              onMouseOut={(e) => e.target.style.color = '#003366'} // Back to Primary Blue
            >
              Projects
            </a>
            <CategoryCard data={data.projects} />
          </div>
        </div>
        
        {/* Progress Tracker */}
        <ProgressTracker data={data} />
      </div>
    </div>
  );
};

export default Dashboard;