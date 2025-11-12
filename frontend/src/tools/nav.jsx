import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav as BootstrapNav, Container, NavDropdown } from "react-bootstrap";
import { useFlash } from "../context/flashContext";
import AuthAPI from "../api/authentication";
import ProfilesAPI from "../api/profiles";


const Nav = () => {
  console.log("NAV RELOADING")
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showFlash } = useFlash();
  const token = localStorage.getItem("session");
  
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [username, setUsername] = React.useState("");

  console.log(token)
  React.useEffect(() => {
    const excludedPaths = ["/login", "/register", "/forgotPassword", "/resetPassword"];

    const shouldSkip = excludedPaths.some(prefix =>
      location.pathname.startsWith(prefix)
    );

    

    console.log("ENTERING EFFECT")
    const validateSession = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        localStorage.removeItem("uuid");
        localStorage.removeItem("session");
        setIsAuthenticated(false);
        
        if (shouldSkip) {
          return;
        }
        navigate("/");
        return;
      }

      try {
        const response = await AuthAPI.validateSession();
        // console.log(response)
        
        if (response.status === 200) {
          setIsAuthenticated(true);
          
          // Load user profile data
          try {
            const profileRes = await ProfilesAPI.get();
            setUsername(profileRes.data.username || "User");
            
            // Load avatar
            const avatarRes = await ProfilesAPI.getAvatar();
            const blob = avatarRes.data;
            const url = URL.createObjectURL(blob);
            if (url) {
              setAvatarUrl(url);
            }
          } catch (error) {
            console.error("Failed to load profile data:", error);
            // Set defaults if profile loading fails
            setUsername("User");
          }
        } else {
          // Non-200 response
          localStorage.removeItem("uuid");
          localStorage.removeItem("session");
          setIsAuthenticated(false);
          if (shouldSkip) {
            return;
          }
          navigate("/");
        }
      } catch (error) {
        // Request failed
        console.error("Session validation failed:", error);
        localStorage.removeItem("uuid");
        localStorage.removeItem("session");
        setIsAuthenticated(false);
        if (shouldSkip) {
          return;
        }
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
    
    return () => {
      if (avatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [token, navigate]);

  const logout = async () => {
    const uuid = localStorage.getItem("uuid");

    try {
      await AuthAPI.logout();
      showFlash("Successfully Logged out", "success");
    } catch (error) {
      showFlash(error.detail, "error");
      console.error("Logout failed:", error);
    }

    if (avatarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarUrl);
    }

    localStorage.removeItem("uuid");
    localStorage.removeItem("session");
    setIsAuthenticated(false);
    setAvatarUrl(null);
    setUsername("");
    navigate("/");
  };

/*
  if (isLoading) {
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
        </Container>
      </Navbar>
    );
  }
*/
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
          <BootstrapNav className="ms-auto gap-3 align-items-center">
            {isAuthenticated ? (
              <>
                {/* Moved to logout and profile
                <BootstrapNav.Link as={NavLink} to="/profile" className="mx-3">
                  Profile
                </BootstrapNav.Link>
                */}
                <NavDropdown
                  title={
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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

                <BootstrapNav.Link as={NavLink} to="/resumes" className="mx-3">
                  Resumes
                </BootstrapNav.Link>

                 <BootstrapNav.Link as={NavLink} to="/coverletter" className="mx-3">
                  Cover Letters
                </BootstrapNav.Link>

                <NavDropdown
                  title={
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate("/profile");
                      }}
                      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <img
                        src={avatarUrl || "/default.png"}
                        alt="Profile"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: "8px",
                          border: "2px solid #fff"
                        }}
                      />
                      {username}
                    </span>
                  }
                  id="profile-dropdown"
                  className="mx-3"
                  align="end"
                  show={showProfileDropdown}
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <NavDropdown.Item as={NavLink} to="/profile">
                    <i className="fas fa-user" style={{ marginRight: "8px" }}></i>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logout}>
                    <i className="fas fa-sign-out-alt" style={{ marginRight: "8px" }}></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
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