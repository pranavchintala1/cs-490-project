/**
 * AISuggestionPanel Component
 * Sidebar panel displaying AI suggestions for resumes
 * Related to UC-047, UC-049, UC-050
 */

import React, { useState } from 'react';
import './AISuggestionPanel.css';

export default function AISuggestionPanel({
  type, // 'content', 'skills', or 'experience'
  suggestions,
  onAccept,
  onReject,
  onClose,
  loading = false,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!suggestions) {
    return null;
  }

  const renderContentSuggestions = () => {
    return (
      <div className="suggestion-content">
        <div className="suggestion-section">
          <h5>Generated Professional Summary</h5>
          <div className="suggestion-box">
            <p>{suggestions.generated_summary}</p>
          </div>
          <button
            className="btn btn-sm btn-success me-2"
            onClick={() => onAccept({ summary: suggestions.generated_summary })}
          >
            ✓ Accept Summary
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onReject('summary')}
          >
            ✗ Reject
          </button>
        </div>

        <div className="suggestion-section mt-4">
          <h5>Suggested Bullet Points ({suggestions.generated_bullets?.length || 0})</h5>
          <div className="bullets-list">
            {suggestions.generated_bullets?.map((bullet, idx) => (
              <div key={idx} className="bullet-item">
                <input type="checkbox" id={`bullet-${idx}`} defaultChecked />
                <label htmlFor={`bullet-${idx}`} className="bullet-text">
                  {bullet}
                </label>
              </div>
            ))}
          </div>
          <button
            className="btn btn-sm btn-success me-2"
            onClick={() => {
              const selectedBullets = suggestions.generated_bullets?.filter(
                (_, idx) => document.getElementById(`bullet-${idx}`)?.checked
              );
              onAccept({ experience_bullets: selectedBullets });
            }}
          >
            ✓ Add Selected Bullets
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onReject('bullets')}
          >
            ✗ Reject
          </button>
        </div>

        <div className="suggestion-section mt-4">
          <h5>Suggested Skills ({suggestions.suggested_skills?.length || 0})</h5>
          <div className="skills-list">
            {suggestions.suggested_skills?.map((skill, idx) => (
              <span key={idx} className="skill-badge">
                {skill}
                <input type="hidden" defaultValue={skill} />
              </span>
            ))}
          </div>
          <button
            className="btn btn-sm btn-success me-2"
            onClick={() => {
              const skills = Array.from(document.querySelectorAll('.skill-badge input')).map(
                (el) => el.value
              );
              onAccept({ skills });
            }}
          >
            ✓ Add All Skills
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onReject('skills')}
          >
            ✗ Reject
          </button>
        </div>

        <div className="suggestion-section mt-4">
          <div className="relevance-score">
            <strong>Relevance Score:</strong> {suggestions.relevance_score || 0}%
          </div>
          <p className="text-muted small">
            Keywords found: {suggestions.keywords_found?.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  };

  const renderSkillsSuggestions = () => {
    return (
      <div className="suggestion-content">
        <div className="suggestion-section">
          <h5>Skills to Emphasize ({suggestions.skills_to_emphasize?.length || 0})</h5>
          <div className="skills-list highlight">
            {suggestions.skills_to_emphasize?.map((skill, idx) => (
              <span key={idx} className="skill-badge success">
                ⭐ {skill}
              </span>
            ))}
          </div>
          {suggestions.skills_to_emphasize?.length > 0 && (
            <button
              className="btn btn-sm btn-success mt-2"
              onClick={() => onAccept({ skills_to_emphasize: suggestions.skills_to_emphasize })}
            >
              ✓ Prioritize These
            </button>
          )}
        </div>

        <div className="suggestion-section mt-4">
          <h5>Recommended Skills ({suggestions.recommended_skills?.length || 0})</h5>
          <div className="skills-list">
            {suggestions.recommended_skills?.map((skill, idx) => (
              <span key={idx} className="skill-badge info">
                + {skill}
              </span>
            ))}
          </div>
          {suggestions.recommended_skills?.length > 0 && (
            <button
              className="btn btn-sm btn-info mt-2"
              onClick={() => onAccept({ recommended_skills: suggestions.recommended_skills })}
            >
              ✓ Add Recommended Skills
            </button>
          )}
        </div>

        <div className="suggestion-section mt-4">
          <h5>Missing Skills ({suggestions.missing_skills?.length || 0})</h5>
          {suggestions.missing_skills?.length > 0 ? (
            <div className="skills-list">
              {suggestions.missing_skills?.map((skill, idx) => (
                <span key={idx} className="skill-badge danger">
                  ⚠️ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">Great! You have all critical skills covered.</p>
          )}
        </div>

        <div className="suggestion-section mt-4">
          <div className="optimization-score">
            <strong>Optimization Score:</strong> {suggestions.optimization_score || 0}%
          </div>
          <p className="text-muted small">
            {suggestions.total_match}
          </p>
        </div>
      </div>
    );
  };

  const renderExperienceSuggestions = () => {
    return (
      <div className="suggestion-content">
        {suggestions.tailored_experiences?.map((exp, expIdx) => (
          <div key={expIdx} className="suggestion-section">
            <div className="experience-header">
              <h5>{exp.title || 'Experience Entry'} #{exp.index + 1}</h5>
              <span className="relevance-badge">
                Relevance: {exp.relevance_score}%
              </span>
            </div>

            <div className="original-text">
              <strong>Original:</strong>
              <p className="text-muted">{exp.original || 'No description'}</p>
            </div>

            {exp.matched_keywords?.length > 0 && (
              <div className="matched-keywords">
                <strong>Matched Keywords:</strong>
                <div className="keywords-list">
                  {exp.matched_keywords.map((kw, idx) => (
                    <span key={idx} className="keyword-badge">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="variations-container">
              <strong>Suggested Variations:</strong>
              <div className="variation-selector">
                {exp.variations?.map((variation, varIdx) => (
                  <div key={varIdx} className="variation-option">
                    <input
                      type="radio"
                      id={`var-${expIdx}-${varIdx}`}
                      name={`variation-${expIdx}`}
                      defaultChecked={varIdx === 0}
                    />
                    <label htmlFor={`var-${expIdx}-${varIdx}`} className="variation-text">
                      {variation}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-sm btn-success mt-2"
              onClick={() => {
                const selected = document.querySelector(`input[name="variation-${expIdx}"]:checked`)
                  ?.nextElementSibling?.textContent;
                onAccept({ experience_index: exp.index, new_description: selected });
              }}
            >
              ✓ Accept This Variation
            </button>
            <button
              className="btn btn-sm btn-outline-secondary mt-2 ms-2"
              onClick={() => onReject(`experience-${exp.index}`)}
            >
              ✗ Skip
            </button>
          </div>
        ))}

        {suggestions.total_experiences > 0 && (
          <div className="suggestion-section mt-4">
            <div className="average-relevance">
              <strong>Average Relevance:</strong> {suggestions.average_relevance || 0}%
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTitleByType = () => {
    switch (type) {
      case 'content':
        return '✨ Generated Content';
      case 'skills':
        return '📊 Skills Optimization';
      case 'experience':
        return '🎯 Tailored Experience';
      default:
        return 'AI Suggestions';
    }
  };

  return (
    <div className="ai-suggestion-panel">
      <div className="panel-header">
        <h4>{getTitleByType()}</h4>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Generating suggestions...</p>
          </div>
        ) : (
          <>
            {type === 'content' && renderContentSuggestions()}
            {type === 'skills' && renderSkillsSuggestions()}
            {type === 'experience' && renderExperienceSuggestions()}
          </>
        )}
      </div>

      <div className="panel-footer">
        <button className="btn btn-secondary btn-sm w-100" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
