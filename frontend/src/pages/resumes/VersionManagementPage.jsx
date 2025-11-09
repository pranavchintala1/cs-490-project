import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumesAPI from '../../api/resumes';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch versions from backend
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ResumesAPI.getVersions(id);
        setVersions(response.data || response);
      } catch (err) {
        setError(err.message || 'Failed to load versions');
        console.error('Error loading versions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
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

  const handleRestore = async (versionId) => {
    if (window.confirm('Are you sure you want to restore this version?')) {
      try {
        await ResumesAPI.restoreVersion(id, versionId);
        alert('Version restored successfully!');
        navigate(`/resumes/edit/${id}`);
      } catch (err) {
        alert('Failed to restore version: ' + err.message);
      }
    }
  };

  const handleDelete = async (versionId) => {
    if (window.confirm('Are you sure you want to delete this version?')) {
      try {
        await ResumesAPI.deleteVersion(id, versionId);
        setVersions(versions.filter((v) => v._id !== versionId));
      } catch (err) {
        alert('Failed to delete version: ' + err.message);
      }
    }
  };

  const handleCreateFromVersion = async (versionId) => {
    const version = versions.find((v) => v._id === versionId);
    const newName = prompt('Enter name for new version:', `${version.name} (Copy)`);
    if (newName) {
      try {
        await ResumesAPI.createVersion(id, {
          name: newName,
          description: `Copy of ${version.name}`,
          resume_data: version.resume_data,
        });
        alert(`New version "${newName}" created!`);
        // Refresh versions list
        const response = await ResumesAPI.getVersions(id);
        setVersions(response.data || response);
      } catch (err) {
        alert('Failed to create version: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="container mt-5"><h2>Loading versions...</h2></div>;
  }

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger mb-4">{error}</div>}

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
                key={version._id}
                className={`version-item`}
              >
                <div className="version-checkbox">
                  <input
                    type="checkbox"
                    id={`version-${version._id}`}
                    checked={selectedVersions.includes(version._id)}
                    onChange={() => handleVersionSelect(version._id)}
                    disabled={selectedVersions.length === 2 && !selectedVersions.includes(version._id)}
                  />
                </div>
                <div className="version-info">
                  <h4>{version.name}</h4>
                  <p className="version-description">{version.description}</p>
                  <p className="version-date">
                    Created: {new Date(version.date_created).toLocaleString()}
                  </p>
                  {version.job_linked && (
                    <p className="version-job">📌 Linked to: {version.job_linked}</p>
                  )}
                </div>
                <div className="version-actions">
                  <button
                    onClick={() => handleRestore(version._id)}
                    className="btn btn-sm btn-success"
                    title="Restore this version"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleCreateFromVersion(version._id)}
                    className="btn btn-sm btn-info"
                    title="Create a copy of this version"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(version._id)}
                    className="btn btn-sm btn-danger"
                    title="Delete this version"
                  >
                    Delete
                  </button>
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
                  version1={versions.find((v) => v._id === selectedVersions[0])}
                  version2={versions.find((v) => v._id === selectedVersions[1])}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
