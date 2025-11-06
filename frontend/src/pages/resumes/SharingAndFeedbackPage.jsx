import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackComments from '../../components/resumes/FeedbackComments';
import SharingControls from '../../components/resumes/SharingControls';
import '../../styles/resumes.css';

/**
 * SharingAndFeedbackPage Component
 * Share resume and manage feedback from reviewers
 * Related to UC-054
 */
export default function SharingAndFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    canComment: true,
    canDownload: true,
    expirationDays: 30,
  });
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState('');

  // TODO: Replace with API call when backend is ready
  useEffect(() => {
    const mockResume = {
      id: id,
      name: 'Software Engineer Resume',
    };
    setResume(mockResume);

    const mockFeedback = [
      {
        id: 1,
        reviewer: 'Jane Smith',
        email: 'jane@example.com',
        date: '2024-11-05T14:30:00',
        comment: 'Great experience section! Consider adding more metrics to the achievements.',
        resolved: false,
      },
      {
        id: 2,
        reviewer: 'Mike Johnson',
        email: 'mike@example.com',
        date: '2024-11-04T10:00:00',
        comment: 'Skills section looks good. Maybe reorder them by relevance to the job?',
        resolved: true,
      },
    ];
    setFeedback(mockFeedback);
  }, [id]);

  const handleGenerateShareLink = () => {
    // TODO: Replace with API call when backend is ready
    const mockLink = `https://example.com/resume-share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(mockLink);
    setIsSharing(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const comment = {
      id: feedback.length + 1,
      reviewer: 'You',
      email: 'your@email.com',
      date: new Date().toISOString(),
      comment: newComment,
      resolved: false,
    };

    setFeedback([...feedback, comment]);
    setNewComment('');
  };

  const handleResolveComment = (commentId) => {
    setFeedback(
      feedback.map((f) =>
        f.id === commentId ? { ...f, resolved: !f.resolved } : f
      )
    );
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      setFeedback(feedback.filter((f) => f.id !== commentId));
    }
  };

  const handleRevokeShare = () => {
    if (window.confirm('Revoke sharing? The link will no longer work.')) {
      setShareLink('');
      setIsSharing(false);
    }
  };

  if (!resume) {
    return <div className="container mt-5"><h2>Loading resume...</h2></div>;
  }

  return (
    <div className="container mt-5">
      <div className="sharing-header">
        <h1>Share & Get Feedback</h1>
        <button onClick={() => navigate(`/resumes/edit/${id}`)} className="btn btn-secondary">
          Back
        </button>
      </div>

      <div className="sharing-layout">
        <div className="sharing-controls-section">
          <h3>Share Your Resume</h3>
          <SharingControls
            isSharing={isSharing}
            shareLink={shareLink}
            shareSettings={shareSettings}
            onGenerateLink={handleGenerateShareLink}
            onCopyLink={handleCopyLink}
            onRevokeShare={handleRevokeShare}
            onSettingsChange={setShareSettings}
          />
        </div>

        <div className="feedback-section">
          <h3>Feedback & Comments</h3>

          <div className="add-comment-form mb-4">
            <h5>Add Comment</h5>
            <textarea
              className="form-control mb-2"
              rows="3"
              placeholder="Add your own notes or feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment} className="btn btn-primary">
              Add Comment
            </button>
          </div>

          <div className="feedback-list">
            {feedback.length === 0 ? (
              <div className="alert alert-info">
                No feedback yet. Share your resume to get feedback from others!
              </div>
            ) : (
              <>
                <h5>{feedback.length} Comment(s)</h5>
                <FeedbackComments
                  feedback={feedback}
                  onResolveComment={handleResolveComment}
                  onDeleteComment={handleDeleteComment}
                />
              </>
            )}
          </div>
        </div>

        <div className="shared-with-section">
          <h3>Shared With</h3>
          <div className="alert alert-info">
            <p>Share link created. Anyone with the link can view and comment on your resume.</p>
            <p>
              <strong>Shared since:</strong> {isSharing ? 'Nov 5, 2024' : 'Not shared yet'}
            </p>
            {isSharing && (
              <div className="mt-2">
                <p><strong>Permissions:</strong></p>
                <ul>
                  <li>Comments: {shareSettings.canComment ? '✓ Allowed' : '✗ Disabled'}</li>
                  <li>Download: {shareSettings.canDownload ? '✓ Allowed' : '✗ Disabled'}</li>
                  <li>Expires in: {shareSettings.expirationDays} days</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
