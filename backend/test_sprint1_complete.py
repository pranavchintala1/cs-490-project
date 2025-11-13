# ============================================================================
# COMPREHENSIVE BACKEND TESTS FOR UC-001 through UC-033
# File: test_sprint1_complete.py
# Coverage Goal: 90%+
# ============================================================================

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone
from uuid import uuid4
import bcrypt

from main import app
from sessions.session_manager import session_manager


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_user_id():
    return str(uuid4())


@pytest.fixture
def mock_session(mock_user_id):
    session_token = session_manager.begin_session(mock_user_id)
    return {"uuid": mock_user_id, "session_token": session_token}


@pytest.fixture
def auth_headers(mock_session):
    return {
        "uuid": mock_session["uuid"],
        "Authorization": f"Bearer {mock_session['session_token']}"
    }


# ============================================================================
# UC-001: User Registration Tests
# ============================================================================

def test_register_success(client):
    """UC-001: Test successful user registration"""
    with patch('routes.auth.auth_dao.add_user', new_callable=AsyncMock) as mock_add_user, \
         patch('routes.auth.profiles_dao.add_profile', new_callable=AsyncMock) as mock_add_profile:
        
        mock_add_user.return_value = "user123"
        mock_add_profile.return_value = "user123"
        
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123",
            "full_name": "Test User"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "uuid" in data
        assert "session_token" in data
        assert data["detail"] == "Sucessfully registered user"


def test_register_duplicate_email(client):
    """UC-001: Test registration with duplicate email"""
    from pymongo.errors import DuplicateKeyError
    
    with patch('routes.auth.auth_dao.add_user', new_callable=AsyncMock) as mock_add_user:
        mock_add_user.side_effect = DuplicateKeyError("Duplicate key error")
        
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "existing@example.com",
            "password": "Password123",
            "full_name": "Test User"
        })
        
        assert response.status_code == 400
        assert response.json()["detail"] == "User already exists"


# ============================================================================
# UC-002: User Login Tests
# ============================================================================

def test_login_success(client):
    """UC-002: Test successful login"""
    hashed_password = bcrypt.hashpw("Password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    with patch('routes.auth.auth_dao.get_password', new_callable=AsyncMock) as mock_get_password, \
         patch('routes.auth.auth_dao.get_uuid', new_callable=AsyncMock) as mock_get_uuid:
        
        mock_get_password.return_value = hashed_password
        mock_get_uuid.return_value = "user123"
        
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "Password123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["detail"] == "Successfully logged in"
        assert "uuid" in data
        assert "session_token" in data


def test_login_invalid_credentials(client):
    """UC-002: Test login with invalid credentials"""
    with patch('routes.auth.auth_dao.get_password', new_callable=AsyncMock) as mock_get_password:
        mock_get_password.return_value = None
        
        response = client.post("/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "WrongPassword123"
        })
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid email or password."


def test_login_wrong_password(client):
    """UC-002: Test login with wrong password"""
    hashed_password = bcrypt.hashpw("CorrectPassword123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    with patch('routes.auth.auth_dao.get_password', new_callable=AsyncMock) as mock_get_password, \
         patch('routes.auth.auth_dao.get_uuid', new_callable=AsyncMock) as mock_get_uuid:
        
        mock_get_password.return_value = hashed_password
        mock_get_uuid.return_value = "user123"
        
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword123"
        })
        
        assert response.status_code == 401


# ============================================================================
# UC-005: User Logout Tests
# ============================================================================

def test_logout_success(client, auth_headers):
    """UC-005: Test successful logout"""
    response = client.post("/api/auth/logout", headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json()["detail"] == "Successfully logged out"


def test_logout_no_session(client):
    """UC-005: Test logout without valid session"""
    response = client.post("/api/auth/logout")
    
    assert response.status_code == 401


# ============================================================================
# UC-008: Session Validation Tests
# ============================================================================

def test_validate_session_success(client, auth_headers):
    """UC-008: Test session validation"""
    response = client.post("/api/auth/validate-session", headers=auth_headers)
    
    assert response.status_code == 200
    assert response.json()["detail"] == "Successfully validated session"


def test_validate_session_invalid(client):
    """UC-008: Test invalid session validation"""
    headers = {
        "uuid": "invalid-uuid",
        "Authorization": "Bearer invalid-token"
    }
    response = client.post("/api/auth/validate-session", headers=headers)
    
    assert response.status_code == 401


# ============================================================================
# UC-021: Profile Management Tests
# ============================================================================

def test_get_profile_success(client, auth_headers, mock_user_id):
    """UC-021: Test get profile"""
    mock_profile = {
        "_id": mock_user_id,
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User"
    }
    
    with patch('routes.profiles.profiles_dao.get_profile', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_profile
        
        response = client.get("/api/users/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"


def test_get_profile_not_found(client, auth_headers):
    """UC-021: Test profile not found"""
    with patch('routes.profiles.profiles_dao.get_profile', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None
        
        response = client.get("/api/users/me", headers=auth_headers)
        
        assert response.status_code == 400
        assert response.json()["detail"] == "User profile not found"


def test_update_profile_success(client, auth_headers):
    """UC-021: Test profile update"""
    with patch('routes.profiles.profiles_dao.update_profile', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/users/me", headers=auth_headers, json={
            "full_name": "Updated Name",
            "title": "Senior Engineer"
        })
        
        assert response.status_code == 200
        assert response.json()["detail"] == "Successfully updated profile"


# ============================================================================
# UC-023: Employment History Tests
# ============================================================================

def test_add_employment_success(client, auth_headers):
    """UC-023: Test add employment entry"""
    with patch('routes.employment.employment_dao.add_employment', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = "emp123"
        
        response = client.post("/api/employment", headers=auth_headers, json={
            "title": "Software Engineer",
            "company": "Tech Corp",
            "start_date": "2020-01-01"
        })
        
        assert response.status_code == 200
        assert "employment_id" in response.json()


def test_add_employment_missing_title(client, auth_headers):
    """UC-023: Test add employment without required field"""
    response = client.post("/api/employment", headers=auth_headers, json={
        "company": "Tech Corp",
        "start_date": "2020-01-01"
    })
    
    assert response.status_code == 422


def test_get_all_employment(client, auth_headers, mock_user_id):
    """UC-024: Test get all employment"""
    mock_employment = [
        {"_id": "emp1", "title": "Engineer", "company": "Corp"},
        {"_id": "emp2", "title": "Developer", "company": "Startup"}
    ]
    
    with patch('routes.employment.employment_dao.get_all_employment', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_employment
        
        response = client.get("/api/employment/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json()) == 2


def test_update_employment_success(client, auth_headers):
    """UC-024: Test update employment"""
    with patch('routes.employment.employment_dao.update_employment', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/employment?employment_id=emp123", headers=auth_headers, json={
            "title": "Senior Engineer"
        })
        
        assert response.status_code == 200


def test_delete_employment_success(client, auth_headers):
    """UC-025: Test delete employment"""
    with patch('routes.employment.employment_dao.delete_employment', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = 1
        
        response = client.delete("/api/employment?employment_id=emp123", headers=auth_headers)
        
        assert response.status_code == 200


# ============================================================================
# UC-026: Skills Management Tests
# ============================================================================

def test_add_skill_success(client, auth_headers):
    """UC-026: Test add skill"""
    with patch('routes.skills.skills_dao.add_skill', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = "skill123"
        
        response = client.post("/api/skills", headers=auth_headers, json={
            "name": "Python",
            "proficiency": "Expert",
            "category": "Technical"
        })
        
        assert response.status_code == 200
        assert "skill_id" in response.json()


def test_add_skill_missing_name(client, auth_headers):
    """UC-026: Test add skill without name"""
    response = client.post("/api/skills", headers=auth_headers, json={
        "proficiency": "Expert"
    })
    
    assert response.status_code == 422


def test_get_all_skills(client, auth_headers):
    """UC-026: Test get all skills"""
    mock_skills = [
        {"_id": "s1", "name": "Python", "proficiency": "Expert"},
        {"_id": "s2", "name": "JavaScript", "proficiency": "Advanced"}
    ]
    
    with patch('routes.skills.skills_dao.get_all_skills', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_skills
        
        response = client.get("/api/skills/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json()) == 2


def test_update_skill_success(client, auth_headers):
    """UC-026: Test update skill"""
    with patch('routes.skills.skills_dao.update_skill', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/skills?skill_id=skill123", headers=auth_headers, json={
            "proficiency": "Expert"
        })
        
        assert response.status_code == 200


def test_delete_skill_success(client, auth_headers):
    """UC-026: Test delete skill"""
    with patch('routes.skills.skills_dao.delete_skill', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = 1
        
        response = client.delete("/api/skills?skill_id=skill123", headers=auth_headers)
        
        assert response.status_code == 200


# ============================================================================
# UC-028: Education Management Tests
# ============================================================================

def test_add_education_success(client, auth_headers):
    """UC-028: Test add education"""
    with patch('routes.education.education_dao.add_education', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = "edu123"
        
        response = client.post("/api/education", headers=auth_headers, json={
            "institution_name": "Test University",
            "degree": "Bachelor's Degree",
            "field_of_study": "Computer Science"
        })
        
        assert response.status_code == 200
        assert "education_id" in response.json()


def test_add_education_missing_institution(client, auth_headers):
    """UC-028: Test add education without institution"""
    response = client.post("/api/education", headers=auth_headers, json={
        "degree": "Bachelor's Degree"
    })
    
    assert response.status_code == 422


def test_get_all_education(client, auth_headers):
    """UC-029: Test get all education"""
    mock_education = [
        {"_id": "e1", "institution_name": "Uni", "degree": "BS"}
    ]
    
    with patch('routes.education.education_dao.get_all_education', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_education
        
        response = client.get("/api/education/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json()) == 1


def test_update_education_success(client, auth_headers):
    """UC-029: Test update education"""
    with patch('routes.education.education_dao.update_education', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/education?education_id=edu123", headers=auth_headers, json={
            "gpa": 3.8
        })
        
        assert response.status_code == 200


def test_delete_education_success(client, auth_headers):
    """UC-029: Test delete education"""
    with patch('routes.education.education_dao.delete_education', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = 1
        
        response = client.delete("/api/education?education_id=edu123", headers=auth_headers)
        
        assert response.status_code == 200


# ============================================================================
# UC-030: Certifications Management Tests
# ============================================================================

def test_add_certification_success(client, auth_headers):
    """UC-030: Test add certification"""
    with patch('routes.certifications.certifications_dao.add_certification', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = "cert123"
        
        response = client.post("/api/certifications", headers=auth_headers, json={
            "name": "AWS Certified",
            "issuer": "Amazon"
        })
        
        assert response.status_code == 200
        assert "certification_id" in response.json()


def test_get_all_certifications(client, auth_headers):
    """UC-030: Test get all certifications"""
    mock_certs = [
        {"_id": "c1", "name": "AWS", "issuer": "Amazon"}
    ]
    
    with patch('routes.certifications.certifications_dao.get_all_certifications', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_certs
        
        response = client.get("/api/certifications/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json()) == 1


def test_update_certification_success(client, auth_headers):
    """UC-030: Test update certification"""
    with patch('routes.certifications.certifications_dao.update_certification', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/certifications?certification_id=cert123", headers=auth_headers, json={
            "verified": True
        })
        
        assert response.status_code == 200


def test_delete_certification_success(client, auth_headers):
    """UC-030: Test delete certification"""
    with patch('routes.certifications.certifications_dao.delete_certification', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = 1
        
        response = client.delete("/api/certifications?certification_id=cert123", headers=auth_headers)
        
        assert response.status_code == 200


# ============================================================================
# UC-031: Projects Management Tests
# ============================================================================

def test_add_project_success(client, auth_headers):
    """UC-031: Test add project"""
    with patch('routes.projects.projects_dao.add_project', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = "proj123"
        
        response = client.post("/api/projects", headers=auth_headers, json={
            "project_name": "Awesome Project",
            "description": "A great project"
        })
        
        assert response.status_code == 200
        assert "project_id" in response.json()


def test_add_project_missing_name(client, auth_headers):
    """UC-031: Test add project without name"""
    response = client.post("/api/projects", headers=auth_headers, json={
        "description": "A project"
    })
    
    assert response.status_code == 422


def test_get_all_projects(client, auth_headers):
    """UC-032: Test get all projects"""
    mock_projects = [
        {"_id": "p1", "project_name": "Project A"}
    ]
    
    with patch('routes.projects.projects_dao.get_all_projects', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_projects
        
        response = client.get("/api/projects/me", headers=auth_headers)
        
        assert response.status_code == 200
        assert len(response.json()) == 1


def test_update_project_success(client, auth_headers):
    """UC-032: Test update project"""
    with patch('routes.projects.projects_dao.update_project', new_callable=AsyncMock) as mock_update:
        mock_update.return_value = 1
        
        response = client.put("/api/projects?project_id=proj123", headers=auth_headers, json={
            "status": "Completed"
        })
        
        assert response.status_code == 200


def test_delete_project_success(client, auth_headers):
    """UC-032: Test delete project"""
    with patch('routes.projects.projects_dao.delete_project', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = 1
        
        response = client.delete("/api/projects?project_id=proj123", headers=auth_headers)
        
        assert response.status_code == 200


# ============================================================================
# UC-033: Dashboard Data Tests
# ============================================================================

def test_get_all_user_data_success(client, auth_headers, mock_user_id):
    """UC-033: Test get all user data"""
    with patch('routes.user_data.profiles_dao.get_profile', new_callable=AsyncMock) as mock_profile, \
         patch('routes.user_data.employment_dao.get_all_employment', new_callable=AsyncMock) as mock_emp, \
         patch('routes.user_data.skills_dao.get_all_skills', new_callable=AsyncMock) as mock_skills, \
         patch('routes.user_data.education_dao.get_all_education', new_callable=AsyncMock) as mock_edu, \
         patch('routes.user_data.projects_dao.get_all_projects', new_callable=AsyncMock) as mock_proj, \
         patch('routes.user_data.certifications_dao.get_all_certifications', new_callable=AsyncMock) as mock_cert:
        
        mock_profile.return_value = {"_id": mock_user_id, "username": "test"}
        mock_emp.return_value = [{"_id": "e1", "title": "Engineer"}]
        mock_skills.return_value = [{"_id": "s1", "name": "Python"}]
        mock_edu.return_value = [{"_id": "ed1", "institution_name": "Uni"}]
        mock_proj.return_value = [{"_id": "p1", "project_name": "Project"}]
        mock_cert.return_value = [{"_id": "c1", "name": "Cert"}]
        
        response = client.get("/api/user/me/all_data", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "profile" in data
        assert "employment" in data
        assert "skills" in data
        assert "education" in data
        assert "projects" in data
        assert "certifications" in data


# ============================================================================
# Session Manager Tests
# ============================================================================

def test_session_manager_begin_session():
    """Test session creation"""
    uuid = "test-uuid"
    token = session_manager.begin_session(uuid)
    
    assert token is not None
    assert session_manager.authenticate_session(uuid, token)


def test_session_manager_kill_session():
    """Test session termination"""
    uuid = "test-uuid"
    token = session_manager.begin_session(uuid)
    
    result = session_manager.kill_session(uuid)
    assert result is True
    assert not session_manager.authenticate_session(uuid, token)


def test_session_manager_authenticate_invalid():
    """Test authentication with invalid session"""
    result = session_manager.authenticate_session("invalid-uuid", "invalid-token")
    assert result is False


# ============================================================================
# Error Handling Tests
# ============================================================================

def test_unauthorized_access(client):
    """Test accessing protected route without auth"""
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_invalid_authorization_format(client, mock_user_id):
    """Test invalid authorization header format"""
    headers = {
        "uuid": mock_user_id,
        "Authorization": "InvalidFormat token"
    }
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == 401


def test_missing_uuid_header(client):
    """Test missing UUID header"""
    headers = {"Authorization": "Bearer token"}
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == 401


# ============================================================================
# Run with: pytest test_sprint1_complete.py -v --cov --cov-report=term-missing
# ============================================================================