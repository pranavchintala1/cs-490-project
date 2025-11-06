import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/resumes.css';

/**
 * ResumeList Component
 * Displays all user resumes with options to create, edit, delete, and manage versions
 * Related to UC-046, UC-052
 */
export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Replace with actual API call when backend is ready
  useEffect(() => {
    // Mock data - replace with API call
    const mockResumes = [
      {
        id: 1,
        name: 'Software Engineer Resume',
        template: 'chronological',
        createdAt: '2024-11-01',
        updatedAt: '2024-11-05',
        versions: 3,
        isDefault: true,
      },
      {
        id: 2,
        name: 'Product Manager Resume',
        template: 'functional',
        createdAt: '2024-10-15',
        updatedAt: '2024-10-20',
        versions: 2,
        isDefault: false,
      },
      {
        id: 3,
        name: 'Data Scientist Resume',
        template: 'hybrid',
        createdAt: '2024-09-10',
        updatedAt: '2024-11-03',
        versions: 1,
        isDefault: false,
      },
    ];
    setResumes(mockResumes);
    setLoading(false);
  }, []);

  const filteredResumes = resumes.filter((resume) =>
    resume.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      setResumes(resumes.filter((resume) => resume.id !== id));
    }
  };

  const handleSetDefault = (id) => {
    setResumes(
      resumes.map((resume) => ({
        ...resume,
        isDefault: resume.id === id,
      }))
    );
  };

  if (loading) {
    return <div className="container mt-5"><h2>Loading resumes...</h2></div>;
  }

  return (
    <div className="container mt-5">
      <div className="resume-list-header">
        <h1>My Resumes</h1>
        <Link to="/resumes/create" className="btn btn-primary">
          + Create New Resume
        </Link>
      </div>

      <div className="search-bar mb-4">
        <input
          type="text"
          placeholder="Search resumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      {filteredResumes.length === 0 ? (
        <div className="alert alert-info">
          <p>No resumes found. <Link to="/resumes/create">Create your first resume</Link></p>
        </div>
      ) : (
        <div className="resume-cards-grid">
          {filteredResumes.map((resume) => (
            <div key={resume.id} className="resume-card">
              <div className="resume-card-header">
                <h3>{resume.name}</h3>
                {resume.isDefault && <span className="badge bg-success">Default</span>}
              </div>
              <div className="resume-card-body">
                <p><strong>Template:</strong> {resume.template}</p>
                <p><strong>Versions:</strong> {resume.versions}</p>
                <p><strong>Updated:</strong> {new Date(resume.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="resume-card-actions">
                <Link to={`/resumes/edit/${resume.id}`} className="btn btn-sm btn-secondary">
                  Edit
                </Link>
                <Link to={`/resumes/preview/${resume.id}`} className="btn btn-sm btn-info">
                  Preview
                </Link>
                <Link to={`/resumes/versions/${resume.id}`} className="btn btn-sm btn-warning">
                  Versions ({resume.versions})
                </Link>
                <button
                  onClick={() => handleSetDefault(resume.id)}
                  className={`btn btn-sm ${resume.isDefault ? 'btn-success' : 'btn-outline-success'}`}
                >
                  {resume.isDefault ? 'Default' : 'Set Default'}
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
