import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav as BootstrapNav, Container, Button, NavDropdown } from "react-bootstrap";
import { useFlash } from "../context/flashContext";
import { sendData } from "../tools/db_commands";
import { apiRequest } from "../api";


const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showFlash } = useFlash();
  const token = localStorage.getItem("session");

const logout = async () => {
  const uuid = localStorage.getItem("uuid");

  try {
    apiRequest("/api/auth/logout?uuid=", "", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

  } catch (error) {
    console.error("Logout failed:", error);
  };

    localStorage.removeItem("session");
    localStorage.removeItem("uuid");


    showFlash("Successfully Logged out", "success");
    navigate("/");
  };

  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    // Automatically show dropdown when on dashboard
    setShowDropdown(location.pathname.startsWith("/dashboard"));
  }, [location.pathname]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center">
          <img 
            src="/image.png" 
            alt="Metamorphosis logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          Metamorphosis
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <BootstrapNav className="ms-auto gap-3">
            {token ? (
              <>
                <BootstrapNav.Link as={NavLink} to="/profile" className="mx-3">
                  Profile
                </BootstrapNav.Link>

                <NavDropdown
                  title={
                    <span
                      onClick={(e) => {
                        e.stopPropagation(); // prevents dropdown toggle from hijacking the click
                        navigate("/dashboard");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Dashboard
                    </span>
                  }
                  id="dashboard-dropdown"
                  className="mx-3"
                  show={showDropdown}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <NavDropdown.Item as={NavLink} to="/employment-history">
                    Employment
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/skills">
                    Skills
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/education">
                    Education
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/certifications">
                    Certifications
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/projects">
                    Projects
                  </NavDropdown.Item>
                </NavDropdown>

                <BootstrapNav.Link as={NavLink} to="/jobs" className="mx-3">
                  Jobs
                </BootstrapNav.Link>

                <Button 
                  variant="outline-light" 
                  onClick={logout} 
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <BootstrapNav.Link as={NavLink} to="/login" className="mx-3">
                  Login
                </BootstrapNav.Link>
                <BootstrapNav.Link as={NavLink} to="/register" className="mx-3">
                  Register
                </BootstrapNav.Link>
              </>
            )}
          </BootstrapNav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Nav;
