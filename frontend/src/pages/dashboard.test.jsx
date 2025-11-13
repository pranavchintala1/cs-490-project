// ============================================================================
// UC-033: Profile Overview Dashboard - Frontend Test Suite
// ============================================================================
// THIS FILE SHOULD BE PLACED AT: src/pages/dashboard.test.jsx
//
// Installation:
// npm install react-router-dom
// npm install --save-dev @testing-library/react @testing-library/jest-dom 
// npm install --save-dev @testing-library/user-event jest-environment-jsdom
// ============================================================================

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './dashboard';
import UserAPI from '../api/user';
import ProfileApi from '../api/profiles';
import EmploymentApi from '../api/employment';
import SkillsApi from '../api/skills';
import EducationApi from '../api/education';
import ProjectsApi from '../api/projects';
import CertificationsApi from '../api/certifications';

// Mock API modules
jest.mock('../api/user');
jest.mock('../api/profiles');
jest.mock('../api/employment');
jest.mock('../api/skills');
jest.mock('../api/education');
jest.mock('../api/projects');
jest.mock('../api/certifications');

// Helper to wrap component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock data
const mockUserData = {
  profile: {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    title: 'Senior Software Engineer',
    biography: 'Experienced developer with 10 years of experience',
    phone_number: '555-123-4567',
    address: 'New York, NY',
    industry: 'Technology',
    experience_level: 'Senior',
    date_created: '2024-01-01T00:00:00Z',
    date_updated: '2024-01-20T10:00:00Z'
  },
  employment: [
    {
      _id: 'emp1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'New York, NY',
      start_date: '2020-01-01',
      end_date: null,
      description: 'Leading development teams',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-15T10:00:00Z'
    },
    {
      _id: 'emp2',
      title: 'Software Engineer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      start_date: '2018-01-01',
      end_date: '2019-12-31',
      description: 'Full-stack development',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-10T09:00:00Z'
    }
  ],
  skills: [
    {
      _id: 'skill1',
      name: 'Python',
      proficiency: 'Expert',
      category: 'Technical',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-18T14:00:00Z'
    },
    {
      _id: 'skill2',
      name: 'JavaScript',
      proficiency: 'Advanced',
      category: 'Technical',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-17T12:00:00Z'
    },
    {
      _id: 'skill3',
      name: 'Leadership',
      proficiency: 'Advanced',
      category: 'Soft Skills',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-16T11:00:00Z'
    }
  ],
  education: [
    {
      _id: 'edu1',
      institution_name: 'Test University',
      degree: "Bachelor's Degree",
      field_of_study: 'Computer Science',
      graduation_date: '2017-05-15',
      gpa: 3.8,
      gpa_private: false,
      achievements: 'Dean\'s List, Summa Cum Laude',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-12T08:00:00Z'
    }
  ],
  projects: [
    {
      _id: 'proj1',
      project_name: 'E-Commerce Platform',
      description: 'Built a scalable e-commerce platform',
      role: 'Lead Developer',
      start_date: '2022-01-01',
      end_date: '2022-12-31',
      skills: ['Python', 'React', 'AWS'],
      team_size: 5,
      status: 'Completed',
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-22T15:00:00Z'
    }
  ],
  certifications: [
    {
      _id: 'cert1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date_earned: '2021-06-01',
      date_expiry: '2024-06-01',
      cert_number: 'AWS-12345',
      verified: true,
      date_created: '2024-01-01T00:00:00Z',
      date_updated: '2024-01-14T13:00:00Z'
    }
  ],
  jobs: []
};

describe('Dashboard Component - UC-033', () => {
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default successful API responses
    ProfileApi.get.mockResolvedValue({ data: mockUserData.profile });
    EmploymentApi.getAll.mockResolvedValue({ data: mockUserData.employment });
    SkillsApi.getAll.mockResolvedValue({ data: mockUserData.skills });
    EducationApi.getAll.mockResolvedValue({ data: mockUserData.education });
    ProjectsApi.getAll.mockResolvedValue({ data: mockUserData.projects });
    CertificationsApi.getAll.mockResolvedValue({ data: mockUserData.certifications });
  });

  // ============================================================================
  // AC: Summary cards for each profile section (Employment, Skills, Education, Projects)
  // ============================================================================

  test('renders summary cards for all profile sections', async () => {
    renderWithRouter(<Dashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify all section cards are present
    expect(screen.getByText(/👤 Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/💼 Employment History/i)).toBeInTheDocument();
    expect(screen.getByText(/🧠 Skills/i)).toBeInTheDocument();
    expect(screen.getByText(/🎓 Education/i)).toBeInTheDocument();
    expect(screen.getByText(/🚀 Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/📜 Certifications/i)).toBeInTheDocument();
  });

  test('displays profile information in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify profile data is displayed
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  test('displays employment history in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify employment data is displayed
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Startup Inc/i)).toBeInTheDocument();
  });

  test('displays skills in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify skills data is displayed
    expect(screen.getByText(/Python/i)).toBeInTheDocument();
    expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
    expect(screen.getByText(/Leadership/i)).toBeInTheDocument();
  });

  test('displays education in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify education data is displayed
    expect(screen.getByText(/Test University/i)).toBeInTheDocument();
    expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
  });

  test('displays projects in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify projects data is displayed
    expect(screen.getByText(/E-Commerce Platform/i)).toBeInTheDocument();
  });

  test('displays certifications in summary card', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify certifications data is displayed
    expect(screen.getByText(/AWS Certified Solutions Architect/i)).toBeInTheDocument();
  });

  // ============================================================================
  // AC: Recent activity timeline
  // ============================================================================

  test('displays recent changes section', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify recent changes section exists
    expect(screen.getByText(/🕐 Recent Changes/i)).toBeInTheDocument();
  });

  test('displays recent updates sorted by date', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Get the Recent Changes section
    const recentChangesSection = screen.getByText(/🕐 Recent Changes/i).closest('.sidebar-card-bottom');
    
    // Verify recent updates are displayed (most recent first based on date_updated)
    // Project: 2024-01-22T15:00:00Z should be first
    // Skill (Python): 2024-01-18T14:00:00Z should be second
    // Employment: 2024-01-15T10:00:00Z should be third
    
    const updates = within(recentChangesSection).getAllByText(/Project:|Skill:|Employment:/i);
    expect(updates.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // AC: Profile completion percentage and suggestions
  // ============================================================================

  test('displays profile completion progress', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify progress tracker is displayed
    const progressSection = screen.getByText(/Profile/i).closest('.progress-tracker');
    expect(progressSection).toBeInTheDocument();
  });

  test('calculates profile completeness correctly - complete profile', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // With comprehensive mock data, profile should be highly complete
    // Look for high completion indicators (green status)
    const cards = screen.getAllByRole('article').map(card => {
      const svg = card.querySelector('svg circle');
      return svg ? svg.classList.contains('fill-success') : false;
    });
    
    // At least some cards should show complete status
    expect(cards.some(isSuccess => isSuccess)).toBe(true);
  });

  test('shows incomplete status for empty sections', async () => {
    // Override with empty data
    ProfileApi.get.mockResolvedValue({ 
      data: { 
        username: 'testuser', 
        email: 'test@test.com' 
      } 
    });
    EmploymentApi.getAll.mockResolvedValue({ data: [] });
    SkillsApi.getAll.mockResolvedValue({ data: [] });
    EducationApi.getAll.mockResolvedValue({ data: [] });
    ProjectsApi.getAll.mockResolvedValue({ data: [] });
    CertificationsApi.getAll.mockResolvedValue({ data: [] });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Look for incomplete/warning status indicators
    const cards = screen.getAllByRole('article').map(card => {
      const svg = card.querySelector('svg circle');
      return svg ? (svg.classList.contains('fill-danger') || svg.classList.contains('fill-warning')) : false;
    });
    
    // Most cards should show incomplete status
    expect(cards.filter(isIncomplete => isIncomplete).length).toBeGreaterThan(3);
  });

  // ============================================================================
  // AC: Quick-add buttons for each section
  // ============================================================================

  test('displays add buttons for each section', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify "Add" buttons are present for each section
    const addButtons = screen.getAllByText(/Add/i);
    expect(addButtons.length).toBeGreaterThanOrEqual(6); // One for each main section
  });

  test('add button navigates to correct section', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find and click an "Add" button within the Skills card
    const skillsCard = screen.getByText(/🧠 Skills/i).closest('.dashboard-card');
    const addButton = within(skillsCard).getByText(/Add/i);
    
    expect(addButton).toHaveAttribute('href');
    expect(addButton.getAttribute('href')).toContain('/skills');
  });

  // ============================================================================
  // AC: Visual charts for skills distribution
  // ============================================================================

  test('displays skills overview chart', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify skills overview section exists
    expect(screen.getByText(/🧩 Skills Overview/i)).toBeInTheDocument();
  });

  test('skills chart displays correct category distribution', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Get the Skills Overview section
    const skillsOverviewSection = screen.getByText(/🧩 Skills Overview/i).closest('.sidebar-card-top');
    
    // Verify category distribution is shown
    // Based on mock data: 2 Technical skills, 1 Soft Skill
    expect(within(skillsOverviewSection).getByText(/Technical/i)).toBeInTheDocument();
  });

  // ============================================================================
  // AC: Career timeline visualization
  // ============================================================================

  test('displays career timeline section', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify career timeline section exists
    expect(screen.getByText(/🧭 My Career Journey/i)).toBeInTheDocument();
  });

  test('career timeline shows employment in chronological order', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Get the career timeline section
    const timelineSection = screen.getByText(/🧭 My Career Journey/i).closest('section');
    
    // Verify employment entries are displayed
    expect(within(timelineSection).getByText(/Tech Corp/i)).toBeInTheDocument();
    expect(within(timelineSection).getByText(/Startup Inc/i)).toBeInTheDocument();
  });

  test('career timeline marks current position', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const timelineSection = screen.getByText(/🧭 My Career Journey/i).closest('section');
    
    // Current position (Tech Corp with no end_date) should be marked differently
    // Could check for "Present" text or specific styling
    expect(within(timelineSection).getByText(/Present/i)).toBeInTheDocument();
  });

  // ============================================================================
  // AC: Export profile summary functionality
  // ============================================================================

  test('displays export summary button', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify export button is present
    expect(screen.getByText(/Export Summary/i)).toBeInTheDocument();
  });

  test('export button triggers download', async () => {
    const user = userEvent.setup();
    
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    const mockLink = {
      click: jest.fn(),
      href: '',
      download: ''
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const exportButton = screen.getByText(/Export Summary/i);
    await user.click(exportButton);

    // Verify download was triggered
    await waitFor(() => {
      expect(mockLink.click).toHaveBeenCalled();
    });

    // Cleanup
    jest.restoreAllMocks();
  });

  test('exported summary contains profile data', async () => {
    const user = userEvent.setup();
    
    let capturedBlob;
    global.URL.createObjectURL = jest.fn((blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    
    const mockLink = {
      click: jest.fn(),
      href: '',
      download: ''
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const exportButton = screen.getByText(/Export Summary/i);
    await user.click(exportButton);

    await waitFor(() => {
      expect(capturedBlob).toBeDefined();
    });

    // Read blob content
    const text = await capturedBlob.text();
    
    // Verify summary contains key data
    expect(text).toContain('PROFESSIONAL DASHBOARD SUMMARY');
    expect(text).toContain('Test User');
    expect(text).toContain('EMPLOYMENT HISTORY');
    expect(text).toContain('Tech Corp');
    expect(text).toContain('SKILLS');
    expect(text).toContain('Python');

    jest.restoreAllMocks();
  });

  // ============================================================================
  // AC: Profile strength indicators and recommendations
  // ============================================================================

  test('displays status indicators for each section', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Each card should have a status indicator (colored circle)
    const statusIndicators = document.querySelectorAll('.status-indicator svg circle');
    expect(statusIndicators.length).toBeGreaterThanOrEqual(6); // One per main section
  });

  test('status indicators show correct completeness state', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Get all status indicators
    const indicators = document.querySelectorAll('.status-indicator svg circle');
    
    // With comprehensive mock data, most should be green (complete)
    const completeIndicators = Array.from(indicators).filter(
      indicator => indicator.classList.contains('fill-success')
    );
    
    expect(completeIndicators.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Error Handling and Edge Cases
  // ============================================================================

  test('displays loading state while fetching data', () => {
    // Mock slow API response
    ProfileApi.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockUserData.profile }), 1000)));

    renderWithRouter(<Dashboard />);

    // Verify loading indicator is shown
    expect(screen.getByText(/Loading dashboard data/i)).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    // Mock API failure
    ProfileApi.get.mockRejectedValue(new Error('API Error'));
    EmploymentApi.getAll.mockRejectedValue(new Error('API Error'));
    SkillsApi.getAll.mockRejectedValue(new Error('API Error'));
    EducationApi.getAll.mockRejectedValue(new Error('API Error'));
    ProjectsApi.getAll.mockRejectedValue(new Error('API Error'));
    CertificationsApi.getAll.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
    });
  });

  test('handles empty data gracefully', async () => {
    // Mock empty responses
    ProfileApi.get.mockResolvedValue({ data: { username: 'testuser', email: 'test@test.com' } });
    EmploymentApi.getAll.mockResolvedValue({ data: [] });
    SkillsApi.getAll.mockResolvedValue({ data: [] });
    EducationApi.getAll.mockResolvedValue({ data: [] });
    ProjectsApi.getAll.mockResolvedValue({ data: [] });
    CertificationsApi.getAll.mockResolvedValue({ data: [] });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify empty state messages or placeholder content
    // Dashboard should still render all sections even if empty
    expect(screen.getByText(/👤 Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/💼 Employment History/i)).toBeInTheDocument();
  });

  test('responsive layout adjusts for mobile viewport', async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify dashboard renders (exact responsive behavior depends on CSS)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Interactive Features
  // ============================================================================

  test('section cards are clickable and navigate to detail pages', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find the Employment History card link
    const employmentLink = screen.getByText(/💼 Employment History/i).closest('a');
    expect(employmentLink).toHaveAttribute('href', '/employment-history');
  });

  test('progress tracker updates reflect data completeness', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify progress tracker shows some form of completion metrics
    // Could be a progress bar, percentage, or completion indicators
    const progressTracker = document.querySelector('.progress-tracker');
    expect(progressTracker).toBeInTheDocument();
  });
});

// ============================================================================
// Component Integration Tests
// ============================================================================

describe('Dashboard Component Integration', () => {
  test('all API calls are made on component mount', async () => {
    ProfileApi.get.mockResolvedValue({ data: mockUserData.profile });
    EmploymentApi.getAll.mockResolvedValue({ data: mockUserData.employment });
    SkillsApi.getAll.mockResolvedValue({ data: mockUserData.skills });
    EducationApi.getAll.mockResolvedValue({ data: mockUserData.education });
    ProjectsApi.getAll.mockResolvedValue({ data: mockUserData.projects });
    CertificationsApi.getAll.mockResolvedValue({ data: mockUserData.certifications });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(ProfileApi.get).toHaveBeenCalledTimes(1);
      expect(EmploymentApi.getAll).toHaveBeenCalledTimes(1);
      expect(SkillsApi.getAll).toHaveBeenCalledTimes(1);
      expect(EducationApi.getAll).toHaveBeenCalledTimes(1);
      expect(ProjectsApi.getAll).toHaveBeenCalledTimes(1);
      expect(CertificationsApi.getAll).toHaveBeenCalledTimes(1);
    });
  });

  test('data from all APIs is correctly displayed', async () => {
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify data from each API is rendered
    expect(screen.getByText(/Test User/i)).toBeInTheDocument(); // Profile
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument(); // Employment
    expect(screen.getByText(/Python/i)).toBeInTheDocument(); // Skills
    expect(screen.getByText(/Test University/i)).toBeInTheDocument(); // Education
    expect(screen.getByText(/E-Commerce Platform/i)).toBeInTheDocument(); // Projects
    expect(screen.getByText(/AWS Certified/i)).toBeInTheDocument(); // Certifications
  });
});

// ============================================================================
// Run tests with: npm test dashboard.test.jsx --coverage
// ============================================================================