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


const fetchDataFromAPI = async (endpoint, headerKey) => {
  console.log("tag:", `?uuid=${localStorage.getItem("uuid")}`);
  const apidata = await apiRequest(`${endpoint}?uuid=`);
  console.log("APIIIII response data:", apidata);

  function transformData(data, titleKey = "title") {
    const arr = Array.isArray(data)
    ? data
    : (data && typeof data === "object")
      ? [data]
      : [];

    console.log("ARR response data:", arr);
    return arr.map(obj => {
      const cleaned = Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null)
      );
      if (Object.keys(cleaned).length === 0) return [];

      const title = cleaned[titleKey] ?? "(no title)";
      const otherValues = Object.entries(cleaned)
        .filter(([key]) => key !== titleKey)
        .map(([_, value]) => value);

      if (otherValues.length === 0 && !cleaned[titleKey]) return [];
      return [title, otherValues];
    }).filter(item => item.length > 0);
  }

  const formatted = transformData(apidata, headerKey);
  console.log("Formatted response data:", formatted);
  return formatted;
};

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
        
        const [profileData, employmentData, skillsData, educationData, projectsData, certData] = await Promise.all([
          fetchDataFromAPI('/api/users/me',"username"),
          fetchDataFromAPI('/api/employment/me',"title"),
          fetchDataFromAPI('/api/skills/me',"name"),
          fetchDataFromAPI('/api/education/me',"institution_name"),
          fetchDataFromAPI('/api/projects/me',"project_name"),
          fetchDataFromAPI('/api/certifications/me',"name")
        ]);

        setData({
          profile: profileData,
          employmentHistory: employmentData,
          skills: skillsData,
          education: educationData,
          projects: projectsData,
          certifcations: certData
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
    { title: 'Certifications', data: data.certifcations }
  ];

  const statusColors = {
    'complete': 'success',
    'partial': 'warning',
    'incomplete': 'danger'
  };

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
                </Card.Body>
              </Card>

              {/* Quick Actions - Takes up the other half */}
              <Card className="sidebar-card-bottom">
                <Card.Body className="d-flex flex-column h-100">
                  <Card.Link 
                    href="/quick-actions" 
                    className="text-decoration-none fw-semibold fs-5 text-primary text-center mb-3 d-block flex-shrink-0 card-title-link"
                  >
                    Quick Actions
                  </Card.Link>
                  <div className="bg-light p-3 rounded flex-grow-1 d-flex align-items-center justify-content-center border">
                    <span className="text-primary fw-semibold">
                      Action Menu
                    </span>
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