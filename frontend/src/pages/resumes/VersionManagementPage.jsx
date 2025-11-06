import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VersionComparison from '../../components/resumes/VersionComparison';
import '../../styles/resumes.css';

/**
 * VersionManagementPage Component
 * Manage resume versions, compare, and restore previous versions
 * Related to UC-052
 */
export default function VersionManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // TODO: Replace with API call when backend is ready
  useEffect(() => {
    const mockVersions = [
      {
        id: 1,
        name: 'v1 - Initial',
        createdAt: '2024-11-05T10:00:00',
        updatedAt: '2024-11-05T10:00:00',
        createdBy: 'User',
        description: 'Initial resume creation',
        isCurrent: true,
        jobLinked: null,
      },
      {
        id: 2,
        name: 'v2 - For Tech Corp',
        createdAt: '2024-11-04T14:30:00',
        updatedAt: '2024-11-04T14:30:00',
        createdBy: 'User',
        description: 'Tailored for Tech Corp software engineer position',
        isCurrent: false,
        jobLinked: 'Senior Developer at Tech Corp',
      },
      {
        id: 3,
        name: 'v3 - Skills Focus',
        createdAt: '2024-11-03T09:15:00',
        updatedAt: '2024-11-03T09:15:00',
        createdBy: 'User',
        description: 'Version with enhanced skills section',
        isCurrent: false,
        jobLinked: null,
      },
    ];
    setVersions(mockVersions);
  }, [id]);

  const handleVersionSelect = (versionId) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((v) => v !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      }
      return prev;
    });
  };

  const handleRestore = (versionId) => {
    if (window.confirm('Are you sure you want to restore this version?')) {
      console.log('Restoring version:', versionId);
      // TODO: Replace with API call when backend is ready
      alert('Version restored successfully!');
    }
  };

  const handleDelete = (versionId) => {
    if (window.confirm('Are you sure you want to delete this version?')) {
      setVersions(versions.filter((v) => v.id !== versionId));
    }
  };

  const handleCreateFromVersion = (versionId) => {
    const version = versions.find((v) => v.id === versionId);
    const newName = prompt('Enter name for new version:', `${version.name} (Copy)`);
    if (newName) {
      console.log('Creating new version from:', versionId);
      // TODO: Replace with API call when backend is ready
      alert(`New version "${newName}" created!`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="version-management-header">
        <h1>Version Management</h1>
        <button onClick={() => navigate(`/resumes/edit/${id}`)} className="btn btn-secondary">
          Back to Resume
        </button>
      </div>

      <div className="version-management-layout">
        <div className="versions-list">
          <h3>Resume Versions</h3>
          <p className="text-muted">Select up to 2 versions to compare</p>
          <div className="versions-container">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`version-item ${version.isCurrent ? 'current' : ''}`}
              >
                <div className="version-checkbox">
                  <input
                    type="checkbox"
                    id={`version-${version.id}`}
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => handleVersionSelect(version.id)}
                    disabled={selectedVersions.length === 2 && !selectedVersions.includes(version.id)}
                  />
                </div>
                <div className="version-info">
                  <h4>{version.name} {version.isCurrent && <span className="badge bg-success">Current</span>}</h4>
                  <p className="version-description">{version.description}</p>
                  <p className="version-date">
                    Created: {new Date(version.createdAt).toLocaleString()}
                  </p>
                  {version.jobLinked && (
                    <p className="version-job">📌 Linked to: {version.jobLinked}</p>
                  )}
                </div>
                <div className="version-actions">
                  {!version.isCurrent && (
                    <button
                      onClick={() => handleRestore(version.id)}
                      className="btn btn-sm btn-success"
                      title="Restore this version"
                    >
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => handleCreateFromVersion(version.id)}
                    className="btn btn-sm btn-info"
                    title="Create a copy of this version"
                  >
                    Copy
                  </button>
                  {!version.isCurrent && (
                    <button
                      onClick={() => handleDelete(version.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete this version"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="version-comparison">
          <h3>Version Comparison</h3>
          {selectedVersions.length === 0 ? (
            <div className="alert alert-info">
              Select 2 versions above to compare side-by-side
            </div>
          ) : selectedVersions.length === 1 ? (
            <div className="alert alert-warning">
              Select one more version to compare
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="btn btn-primary mb-3"
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
              {showComparison && (
                <VersionComparison
                  version1={versions.find((v) => v.id === selectedVersions[0])}
                  version2={versions.find((v) => v.id === selectedVersions[1])}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
