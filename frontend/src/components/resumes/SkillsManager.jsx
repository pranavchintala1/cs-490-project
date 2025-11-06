import React, { useState } from 'react';
import '../../styles/resumes.css';

/**
 * SkillsManager Component
 * Add, remove, and reorder skills in resume
 * Related to UC-049
 */
export default function SkillsManager({ skills, onUpdate }) {
  const [items, setItems] = useState(skills || []);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updatedItems = [...items, newSkill.trim()];
      setItems(updatedItems);
      onUpdate(updatedItems);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const handleMoveSkill = (index, direction) => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setItems(newItems);
    onUpdate(newItems);
  };

  return (
    <div className="skills-manager">
      <h3>Skills</h3>

      <div className="add-skill-form mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter a skill (e.g., React, Python, Leadership)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <button onClick={handleAddSkill} className="btn btn-primary">
            Add Skill
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">No skills added yet</div>
      ) : (
        <div className="skills-list">
          {items.map((skill, index) => (
            <div key={index} className="skill-item">
              <span className="skill-name">{skill}</span>
              <div className="skill-actions">
                <button
                  onClick={() => handleMoveSkill(index, 'up')}
                  disabled={index === 0}
                  className="btn btn-sm btn-outline-secondary"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveSkill(index, 'down')}
                  disabled={index === items.length - 1}
                  className="btn btn-sm btn-outline-secondary"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="btn btn-sm btn-outline-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="skills-info mt-3">
        <small className="text-muted">
          Tip: Reorder skills by relevance to the job. Add skills that match job requirements for better ATS compatibility.
        </small>
      </div>
    </div>
  );
}
