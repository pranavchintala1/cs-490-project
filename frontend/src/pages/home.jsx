import React, { useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import logo from "../logo.svg.png"; 
import "../styles/home.css"; 
import { Link } from "react-router-dom";

const Home = ({ user, session }) => {
  useEffect(() => {
    // Add session or user logic here if needed
  }, [user, session]);

  return (
    <>
      <section className="home-hero d-flex align-items-center text-white text-center">
        <Container>
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="mb-4">
              <img
                src={logo}
                alt="Metamorphosis logo"
                className="hero-logo mb-3"
              />
              <h1 className="fw-bold display-5">Metamorphosis</h1>
            </div>

            <h2 className="lead mb-4">
              Welcome! Let’s start your profile.
            </h2>

            <div>
              <Button 
                as={Link}
                to="/register"
                variant="success"
                size="lg"
                className="me-3"
              >
                Get Started
              </Button>
              
              <Button variant="outline-light" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="features-section py-5 text-center text-white">
        <Container fluid>
          <h2 className="fw-bold mb-5">
            ⚡ Powerful Tools for Every Step
          </h2>

          <Row className="justify-content-center flex-nowrap g-4 overflow-auto">
            <Col xs="auto">
              <Card className="feature-card p-4">
                <Card.Body>
                  <Card.Title>Track Applications</Card.Title>
                  <Card.Text>
                    Keep tabs on every role you apply for — all in one place.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs="auto">
              <Card className="feature-card p-4">
                <Card.Body>
                  <Card.Title>Visual Analytics</Card.Title>
                  <Card.Text>
                    Gain insights into your job search performance and success rates.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs="auto">
              <Card className="feature-card p-4">
                <Card.Body>
                  <Card.Title>Automation Support</Card.Title>
                  <Card.Text>
                    Leverage automation tools to simplify repetitive job tasks.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs="auto">
              <Card className="feature-card p-4">
                <Card.Body>
                  <Card.Title>Smart Insights</Card.Title>
                  <Card.Text>
                    Get actionable recommendations to improve your job search strategy.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;

