import React from 'react';
import '../../styles/resumes.css';

/**
 * VersionComparison Component
 * Compare two resume versions side-by-side
 * Related to UC-052
 */
export default function VersionComparison({ version1, version2 }) {
  if (!version1 || !version2) {
    return <div className="alert alert-warning">Please select two versions to compare</div>;
  }

  return (
    <div className="version-comparison">
      <div className="comparison-container">
        <div className="comparison-column">
          <h5>Version 1: {version1.name}</h5>
          <div className="version-details">
            <p><strong>Created:</strong> {new Date(version1.createdAt).toLocaleString()}</p>
            <p><strong>Description:</strong> {version1.description}</p>
            {version1.jobLinked && (
              <p><strong>Linked to:</strong> {version1.jobLinked}</p>
            )}
          </div>
        </div>

        <div className="comparison-column">
          <h5>Version 2: {version2.name}</h5>
          <div className="version-details">
            <p><strong>Created:</strong> {new Date(version2.createdAt).toLocaleString()}</p>
            <p><strong>Description:</strong> {version2.description}</p>
            {version2.jobLinked && (
              <p><strong>Linked to:</strong> {version2.jobLinked}</p>
            )}
          </div>
        </div>
      </div>

      <div className="comparison-changes">
        <h6>Key Differences</h6>
        <div className="alert alert-info">
          <p><strong>Note:</strong> Full detailed comparison would show:</p>
          <ul>
            <li>Differences in work experience entries</li>
            <li>Skill additions/removals</li>
            <li>Section reordering</li>
            <li>Text modifications</li>
            <li>Format changes</li>
          </ul>
          <p className="mt-3"><em>This feature will be fully implemented when connected to the backend API.</em></p>
        </div>
      </div>
    </div>
  );
}
