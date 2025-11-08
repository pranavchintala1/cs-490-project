import React, { useState, useEffect } from 'react';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import EmploymentAPI from "../api/employment";
import SkillsAPI from "../api/skills";
import EducationAPI from "../api/education";
import ProjectsAPI from "../api/projects";
import ProfilesAPI from "../api/profiles";

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
        const [
          {data: profileData}, 
          {data: employmentData}, 
          {data: skillsData}, 
          {data: educationData}, 
          {data: projectsData}
        ] = await Promise.all([
          ProfilesAPI.get(),
          EmploymentAPI.getAll(),
          SkillsAPI.getAll(),
          EducationAPI.getAll(),
          ProjectsAPI.getAll()
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