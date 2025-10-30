import React, { useState, useEffect } from 'react';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';

// Dashboard component with local dummy data only
const Dashboard = () => {
  const [data, setData] = useState({
    profile: [],
    employmentHistory: [],
    skills: [],
    education: [],
    projects: []
  });

  useEffect(() => {
    // Dummy data for dashboard
    const dummyData = {
      profile: [
        ["Personal Information", ["John Smith", "Software Engineer", "New York, NY"]],
        ["Contact Details", ["john.smith@email.com", "+1 (555) 123-4567", "LinkedIn: /in/johnsmith"]],
        ["Summary", ["5+ years experience", "Full-stack developer", "Team leader"]]
      ],
      employmentHistory: [
        ["Current Position", ["Senior Developer at TechCorp", "2022 - Present", "Led team of 4 developers"]],
        ["Previous Roles", ["Developer at StartupXYZ", "2020 - 2022", "Built scalable web applications"]],
        ["Early Career", ["Junior Developer at WebAgency", "2019 - 2020", "Frontend development"]]
      ],
      skills: [
        ["Programming Languages", ["JavaScript", "Python", "Java", "TypeScript"]],
        ["Frameworks & Libraries", ["React", "Node.js", "Express", "Django"]],
        ["Tools & Technologies", ["Git", "Docker", "AWS", "MongoDB"]]
      ],
      education: [
        ["Degrees", ["Bachelor of Computer Science", "University of Technology", "2015 - 2019"]],
        ["Certifications", ["AWS Certified Developer", "React Developer Certification", "Agile Project Management"]],
        ["Additional Learning", ["Online Courses", "Technical Workshops", "Conference Attendance"]]
      ],
      projects: [
        ["Web Applications", ["E-commerce Platform", "Task Management System", "Social Media Dashboard"]],
        ["Mobile Apps", ["Budget Tracker", "Fitness App", "Recipe Finder"]],
        ["Open Source", ["JavaScript Library", "Documentation Site", "Code Utilities"]]
      ]
    };

    setData(dummyData);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#001E3C', padding: '20px' }}>
      <div style={{ width: '100%' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#FFFFFF',
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
          {[
            { title: "Profile", dataKey: "profile", link: "/profile" },
            { title: "Employment History", dataKey: "employmentHistory", link: "/employment-history" },
            { title: "Skills", dataKey: "skills", link: "/skills" },
            { title: "Education", dataKey: "education", link: "/education" },
            { title: "Projects", dataKey: "projects", link: "/projects" }
          ].map(section => (
            <div key={section.title} style={{
              backgroundColor: '#F9FAFC',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid #D1D5DB',
              flex: '1 1 calc(33.333% - 14px)',
              minWidth: '300px'
            }}>
              <a 
                href={section.link}
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
                {section.title}
              </a>
              <CategoryCard data={data[section.dataKey]} />
            </div>
          ))}
        </div>

        {/* Progress Tracker */}
        <ProgressTracker data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
