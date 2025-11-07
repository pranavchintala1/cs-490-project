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
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
      // Start deletion animation
      setDeletingId(id);
      // Wait for animation to complete (300ms) before removing from state
      setTimeout(() => {
        setResumes(resumes.filter((resume) => resume.id !== id));
        setDeletingId(null);
      }, 300);
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

  const handleRenameStart = (resume) => {
    setEditingId(resume.id);
    setEditingName(resume.name);
  };

  const handleRenameSave = () => {
    if (!editingName.trim()) {
      alert('Resume name cannot be empty');
      return;
    }
    setResumes(
      resumes.map((resume) =>
        resume.id === editingId ? { ...resume, name: editingName.trim() } : resume
      )
    );
    setEditingId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
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
            <div
              key={resume.id}
              className={`resume-card ${deletingId === resume.id ? 'deleting' : ''}`}
            >
              <div className="resume-card-header">
                {editingId === resume.id ? (
                  <div className="resume-name-edit">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameSave()}
                    />
                    <button
                      onClick={handleRenameSave}
                      className="btn btn-sm btn-success ms-2"
                      title="Save new name"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleRenameCancel}
                      className="btn btn-sm btn-secondary ms-1"
                      title="Cancel rename"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3>{resume.name}</h3>
                    {resume.isDefault && <span className="badge bg-success">Default</span>}
                  </>
                )}
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
                  onClick={() => handleRenameStart(resume)}
                  disabled={editingId !== null}
                  className="btn btn-sm btn-primary"
                  title="Rename this resume"
                >
                  Rename
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
