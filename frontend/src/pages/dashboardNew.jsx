import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import BarChart from '../components/BarChart';
import { apiRequest } from "../api";
import CareerTimeline from '../components/Timeline';
import './Dashboard.css';
import { Link } from "react-router-dom";
import RecentChanges from '../components/RecentChanges';

// Helper function to format ISO date to readable format
function formatDate(isoDate) {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day}-${year}, ${hours}:${minutes}`;
}

// Helper function to create an update entry
function createUpdateEntry(isoDate, schemaType, name) {
    if (!isoDate) return null;
    
    const formattedDate = formatDate(isoDate);
    const label = `${schemaType}: ${name}`;
    
    return {
        isoDate: isoDate,
        formatted: formattedDate,
        label: label
    };
}

// Helper function to merge and sort recent updates, keeping top 10
function mergeRecentUpdates(existingUpdates, newUpdates) {
    const allUpdates = [...existingUpdates];
    
    newUpdates.forEach(newUpdate => {
        if (!newUpdate) return;
        allUpdates.push(newUpdate);
    });
    
    // Sort by ISO date string (most recent first) and keep top 10
    allUpdates.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
    return allUpdates.slice(0, 10);
}

// Helper function to merge skill category counts
function mergeSkillCategoryCounts(existingCounts, newCounts) {
    const merged = { ...existingCounts };
    
    Object.entries(newCounts).forEach(([category, count]) => {
        if (category && category !== '') {
            merged[category] = (merged[category] || 0) + count;
        }
    });
    
    return merged;
}

function profileFilter(profiles) {
    const updates = [];
    
    const filtered = profiles.map(profile => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(profile.date_updated, 'Profile', profile.username || 'Unknown'));
        
        if (profile.email !== null && profile.email !== undefined && profile.email !== '') {
            details.push(`Email: ${profile.email}`);
        }
        if (profile.full_name !== null && profile.full_name !== undefined && profile.full_name !== '') {
            details.push(`Full Name: ${profile.full_name}`);
        }
        if (profile.phone_number !== null && profile.phone_number !== undefined && profile.phone_number !== '') {
            details.push(`Phone: ${profile.phone_number}`);
        }
        if (profile.address !== null && profile.address !== undefined && profile.address !== '') {
            details.push(`Address: ${profile.address}`);
        }
        if (profile.title !== null && profile.title !== undefined && profile.title !== '') {
            details.push(`Title: ${profile.title}`);
        }
        if (profile.biography !== null && profile.biography !== undefined && profile.biography !== '') {
            details.push(`Biography: ${profile.biography}`);
        }
        if (profile.industry !== null && profile.industry !== undefined && profile.industry !== '') {
            details.push(`Industry: ${profile.industry}`);
        }
        if (profile.experience_level !== null && profile.experience_level !== undefined && profile.experience_level !== '') {
            details.push(`Experience Level: ${profile.experience_level}`);
        }
        
        return [profile.username, details];
    });
    
    return { filtered, updates, categoryCounts: {} };
}

function skillFilter(skills) {
    const updates = [];
    const categoryCounts = {};
    
    const filtered = skills.map(skill => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(skill.date_updated, 'Skill', skill.name || 'Unknown'));
        
        // Track skill category
        if (skill.category && skill.category !== '') {
            categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
        }
        
        if (skill.proficiency !== null && skill.proficiency !== undefined && skill.proficiency !== '') {
            details.push(`Proficiency: ${skill.proficiency}`);
        }
        if (skill.category !== null && skill.category !== undefined && skill.category !== '') {
            details.push(`Skill Category: ${skill.category}`);
        }
        if (skill.position !== null && skill.position !== undefined && skill.position !== '') {
            details.push(`Position: ${skill.position}`);
        }
        
        return [skill.name, details];
    });
    
    return { filtered, updates, categoryCounts };
}

function employmentFilter(employments) {
    const updates = [];
    
    const filtered = employments.map(employment => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(employment.date_updated, 'Employment', employment.title || 'Unknown'));
        
        if (employment.company !== null && employment.company !== undefined && employment.company !== '') {
            details.push(`Company: ${employment.company}`);
        }
        if (employment.location !== null && employment.location !== undefined && employment.location !== '') {
            details.push(`Location: ${employment.location}`);
        }
        if (employment.start_date !== null && employment.start_date !== undefined && employment.start_date !== '') {
            details.push(`Start Date: ${employment.start_date}`);
        }
        if (employment.end_date !== null && employment.end_date !== undefined && employment.end_date !== '') {
            details.push(`End Date: ${employment.end_date}`);
        }
        if (employment.description !== null && employment.description !== undefined && employment.description !== '') {
            details.push(`Description: ${employment.description}`);
        }
        
        return [employment.title, details];
    });
    
    return { filtered, updates, categoryCounts: {} };
}

function educationFilter(educations) {
    const updates = [];
    
    const filtered = educations.map(education => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(education.date_updated, 'Education', education.institution_name || 'Unknown'));
        
        if (education.degree !== null && education.degree !== undefined && education.degree !== '') {
            details.push(`Degree: ${education.degree}`);
        }
        if (education.field_of_study !== null && education.field_of_study !== undefined && education.field_of_study !== '') {
            details.push(`Field of Study: ${education.field_of_study}`);
        }
        if (education.graduation_date !== null && education.graduation_date !== undefined && education.graduation_date !== '') {
            details.push(`Graduation Date: ${education.graduation_date}`);
        }
        if (education.gpa !== null && education.gpa !== undefined) {
            details.push(`GPA: ${education.gpa}`);
        }
        if (education.gpa_private !== null && education.gpa_private !== undefined) {
            details.push(`GPA Private: ${education.gpa_private}`);
        }
        if (education.education_level !== null && education.education_level !== undefined && education.education_level !== '') {
            details.push(`Education Level: ${education.education_level}`);
        }
        if (education.achievements !== null && education.achievements !== undefined && education.achievements !== '') {
            details.push(`Achievements: ${education.achievements}`);
        }
        if (education.position !== null && education.position !== undefined && education.position !== '') {
            details.push(`Position: ${education.position}`);
        }
        
        return [education.institution_name, details];
    });
    
    return { filtered, updates, categoryCounts: {} };
}

function projectFilter(projects) {
    const updates = [];
    
    const filtered = projects.map(project => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(project.date_updated, 'Project', project.project_name || 'Unknown'));
        
        if (project.description !== null && project.description !== undefined && project.description !== '') {
            details.push(`Description: ${project.description}`);
        }
        if (project.role !== null && project.role !== undefined && project.role !== '') {
            details.push(`Role: ${project.role}`);
        }
        if (project.start_date !== null && project.start_date !== undefined && project.start_date !== '') {
            details.push(`Start Date: ${project.start_date}`);
        }
        if (project.end_date !== null && project.end_date !== undefined && project.end_date !== '') {
            details.push(`End Date: ${project.end_date}`);
        }
        if (project.skills !== null && project.skills !== undefined && project.skills.length > 0) {
            details.push(`Skills: ${project.skills.join(', ')}`);
        }
        if (project.team_size !== null && project.team_size !== undefined) {
            details.push(`Team Size: ${project.team_size}`);
        }
        if (project.details !== null && project.details !== undefined && project.details !== '') {
            details.push(`Details: ${project.details}`);
        }
        if (project.project_url !== null && project.project_url !== undefined && project.project_url !== '') {
            details.push(`Project URL: ${project.project_url}`);
        }
        if (project.achievements !== null && project.achievements !== undefined && project.achievements !== '') {
            details.push(`Achievements: ${project.achievements}`);
        }
        if (project.industry !== null && project.industry !== undefined && project.industry !== '') {
            details.push(`Industry: ${project.industry}`);
        }
        if (project.status !== null && project.status !== undefined && project.status !== '') {
            details.push(`Status: ${project.status}`);
        }
        
        return [project.project_name, details];
    });
    
    return { filtered, updates, categoryCounts: {} };
}

function certificationFilter(certifications) {
    const updates = [];
    
    const filtered = certifications.map(certification => {
        const details = [];
        
        // Track this update
        updates.push(createUpdateEntry(certification.date_updated, 'Certification', certification.name || 'Unknown'));
        
        if (certification.issuer !== null && certification.issuer !== undefined && certification.issuer !== '') {
            details.push(`Issuer: ${certification.issuer}`);
        }
        if (certification.date_earned !== null && certification.date_earned !== undefined && certification.date_earned !== '') {
            details.push(`Date Earned: ${certification.date_earned}`);
        }
        if (certification.date_expiry !== null && certification.date_expiry !== undefined && certification.date_expiry !== '') {
            details.push(`Expiry Date: ${certification.date_expiry}`);
        }
        if (certification.cert_number !== null && certification.cert_number !== undefined && certification.cert_number !== '') {
            details.push(`Certificate Number: ${certification.cert_number}`);
        }
        if (certification.category !== null && certification.category !== undefined && certification.category !== '') {
            details.push(`Category: ${certification.category}`);
        }
        if (certification.position !== null && certification.position !== undefined && certification.position !== '') {
            details.push(`Position: ${certification.position}`);
        }
        if (certification.verified !== null && certification.verified !== undefined) {
            details.push(`Verified: ${certification.verified}`);
        }
        if (certification.document_name !== null && certification.document_name !== undefined && certification.document_name !== '') {
            details.push(`Document: ${certification.document_name}`);
        }
        
        return [certification.name, details];
    });
    
    return { filtered, updates, categoryCounts: {} };
}

function filterBySchema(data, schemaName) {
    switch(schemaName) {
        case 'Profile':
            return profileFilter(data);
        case 'Skill':
            return skillFilter(data);
        case 'Employment':
            return employmentFilter(data);
        case 'Education':
            return educationFilter(data);
        case 'Project':
            return projectFilter(data);
        case 'Certification':
            return certificationFilter(data);
        default:
            throw new Error(`Unknown schema: ${schemaName}`);
    }
}

const fetchDataFromAPI = async (endpoint, schemaName) => {
  const apidata = await apiRequest(`${endpoint}?uuid=`);

  function transformData(data) {
    const arr = Array.isArray(data)
    ? data
    : (data && typeof data === "object")
      ? [data]
      : [];
    
    return filterBySchema(arr, schemaName);
  }
  
  return transformData(apidata);
};

const Dashboard = () => {
  const [data, setData] = useState({
    profile: null,
    employmentHistory: null,
    skills: null,
    education: null,
    projects: null,
    certifications: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [skillCategoryCounts, setSkillCategoryCounts] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [profileResult, employmentResult, skillsResult, educationResult, projectsResult, certResult] = await Promise.all([
          fetchDataFromAPI('/api/users/me',"Profile"),
          fetchDataFromAPI('/api/employment/me',"Employment"),
          fetchDataFromAPI('/api/skills/me',"Skill"),
          fetchDataFromAPI('/api/education/me',"Education"),
          fetchDataFromAPI('/api/projects/me',"Project"),
          fetchDataFromAPI('/api/certifications/me',"Certification")
        ]);

        // Set the filtered data
        setData({
          profile: profileResult.filtered,
          employmentHistory: employmentResult.filtered,
          skills: skillsResult.filtered,
          education: educationResult.filtered,
          projects: projectsResult.filtered,
          certifications: certResult.filtered
        });

        // Merge all updates
        let allUpdates = [];
        allUpdates = mergeRecentUpdates(allUpdates, profileResult.updates);
        allUpdates = mergeRecentUpdates(allUpdates, employmentResult.updates);
        allUpdates = mergeRecentUpdates(allUpdates, skillsResult.updates);
        allUpdates = mergeRecentUpdates(allUpdates, educationResult.updates);
        allUpdates = mergeRecentUpdates(allUpdates, projectsResult.updates);
        allUpdates = mergeRecentUpdates(allUpdates, certResult.updates);
        setRecentUpdates(allUpdates);

        // Merge all skill category counts
        let allCategoryCounts = {};
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, profileResult.categoryCounts);
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, employmentResult.categoryCounts);
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, skillsResult.categoryCounts);
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, educationResult.categoryCounts);
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, projectsResult.categoryCounts);
        allCategoryCounts = mergeSkillCategoryCounts(allCategoryCounts, certResult.categoryCounts);
        setSkillCategoryCounts(allCategoryCounts);

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
      <div className="dashboard-gradient min-vh-100 py-4">
        <Container>
          <h1 className="text-center text-white fw-bold mb-5 display-4">
            Dashboard
          </h1>
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '200px' }}>
            <Spinner animation="border" variant="light" className="mb-3" />
            <p className="text-white fs-5">Loading dashboard data...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-gradient min-vh-100 py-4">
        <Container>
          <h1 className="text-center text-white fw-bold mb-5 display-4">
            Dashboard
          </h1>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <Alert variant="danger" className="d-flex align-items-center">
              <span className="me-2">⚠️</span> {error}
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  const getCompletenessStatus = (cardData) => {
    if (!cardData || cardData.length === 0) {
      return 'incomplete';
    }
    
    const totalItems = cardData.length;
    const itemsWithContent = cardData.filter(([_, values]) => 
      values && values.length > 0 && values.some(v => v && v.trim() !== '')
    ).length;
    
    const completenessRatio = itemsWithContent / totalItems;
    
    if (completenessRatio >= 0.8) {
      return 'complete';
    } else if (completenessRatio >= 0.4) {
      return 'partial';
    } else {
      return 'incomplete';
    }
  };

  const categories = [
    { title: 'Profile', data: data.profile },
    { title: 'Employment History', data: data.employmentHistory },
    { title: 'Skills', data: data.skills },
    { title: 'Education', data: data.education },
    { title: 'Projects', data: data.projects },
    { title: 'Certifications', data: data.certifications }
  ];

  const statusColors = {
    'complete': 'success',
    'partial': 'warning',
    'incomplete': 'danger'
  };

  // Format recent updates for display
  const formattedRecentUpdates = recentUpdates.map(update => [update.formatted, update.label]);

  return (
    <div className="dashboard-bg min-vh-100 py-4">
      <Container fluid>
        <h1 className="text-center text-white fw-bold mb-5 display-4">
          Dashboard
        </h1>

        <Row>
          {/* Left side: 3x2 grid */}
          <Col lg={9}>
            <Row className="g-3">
              {categories.map((category, index) => {
                const status = getCompletenessStatus(category.data);
                const statusVariant = statusColors[status];
                const link = `/${category.title.toLowerCase().replace(/\s+/g, '-')}`;
                
                return (
                  <Col md={6} key={index}>
                    <Card className="dashboard-card">
                      <Card.Body className="d-flex flex-column h-100">
                        {/* Header */}
                        <div className="d-flex align-items-center justify-content-between mb-3 flex-shrink-0">
                          {/* Status indicator */}
                          <div 
                            className="status-indicator" 
                            title={`Status: ${status === 'complete' ? 'Complete' : status === 'partial' ? 'Could be improved' : 'Incomplete'}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14">
                              <circle 
                                cx="7" 
                                cy="7" 
                                r="6" 
                                className={`fill-${statusVariant}`}
                                opacity="0.9"
                              >
                                {status === 'incomplete' && (
                                  <animate
                                    attributeName="opacity"
                                    values="0.9;0.4;0.9"
                                    dur="2s"
                                    repeatCount="indefinite"
                                  />
                                )}
                              </circle>
                            </svg>
                          </div>

                          {/* Title */}
                          <Card.Link 
                            href={link} 
                            className="text-decoration-none fw-semibold fs-5 text-primary flex-grow-1 text-center mx-2 card-title-link"
                          >
                            {category.title}
                          </Card.Link>

                          {/* Button */}
                          <Link 
                            to={{ pathname: link }} 
                            state={{ showForm: true }}
                          >
                            <Button 
                              variant="primary" 
                              size="sm"
                              className="dashboard-btn"
                            >
                              Add
                            </Button>
                          </Link>
                        </div>

                        {/* Card content - scrollable */}
                        <div className="flex-grow-1 overflow-auto card-content">
                          <CategoryCard data={category.data} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>

          {/* Right side: Sticky sidebar with full height */}
          <Col lg={3}>
            <div className="sidebar-sticky">
              {/* Skills Overview - Takes up half the height */}
              <Card className="sidebar-card-top">
                <Card.Body className="d-flex flex-column h-100">
                  <Card.Link 
                    href="/skills" 
                    className="text-decoration-none fw-semibold fs-5 text-primary text-center mb-3 d-block flex-shrink-0 card-title-link"
                  >
                    Skills Overview
                  </Card.Link>
                  <div className="flex-grow-1 overflow-hidden">
                    <BarChart 
                      data={skillCategoryCounts}
                      title="Skills Proficiency"
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* Quick Actions - Takes up the other half */}
              <Card className="sidebar-card-bottom">
                <Card.Body className="d-flex flex-column h-100">
                  <Card.Link 
                    className="text-decoration-none fw-semibold fs-5 text-primary text-center mb-3 d-block flex-shrink-0 card-title-link"
                  >
                    Recent Changes
                  </Card.Link>
                  <div className="flex-grow-1 overflow-hidden">
                    <RecentChanges changes={formattedRecentUpdates} />
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Career Timeline */}
        <Row className="mt-4">
          <Col>
            <CareerTimeline title="My Career Journey" />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;