import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumesAPI from '../../api/resumes';
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
    can_comment: true,
    can_download: true,
    expiration_days: 30,
  });
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Fetch resume and feedback from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resume
        const resumeResponse = await ResumesAPI.get(id);
        setResume(resumeResponse.data || resumeResponse);

        // Fetch feedback
        const feedbackResponse = await ResumesAPI.getFeedback(id);
        setFeedback(feedbackResponse.data || feedbackResponse || []);

        // Fetch share link if exists
        try {
          const shareResponse = await ResumesAPI.getShareLink(id);
          const baseUrl = window.location.origin;
          const token = shareResponse.data?.token || shareResponse.token;
          if (token) {
            setShareLink(`${baseUrl}/resumes/public/${token}`);
            setIsSharing(true);
          }
        } catch (err) {
          // No share link exists yet
          setIsSharing(false);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleGenerateShareLink = async () => {
    try {
      const response = await ResumesAPI.createShareLink(id, shareSettings);
      console.log('Share link response:', response);
      console.log('Response data:', response.data);
      const baseUrl = window.location.origin;
      const token = response.data?.share_link || response.share_link || response.data?.share_data?.token || response.share_data?.token;
      console.log('Extracted token:', token);

      if (!token) {
        alert('Failed to generate share link: No token in response');
        return;
      }

      const fullLink = `${baseUrl}/resumes/public/${token}`;
      console.log('Full link:', fullLink);
      setShareLink(fullLink);
      setIsSharing(true);
      alert('Share link generated successfully!');
    } catch (err) {
      alert('Failed to generate share link: ' + err.message);
      console.error('Share link error:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await ResumesAPI.addFeedback(id, {
        comment: newComment,
        reviewer: 'Current User',
        email: localStorage.getItem('userEmail') || 'user@example.com',
      });

      // Add to local state
      const comment = {
        _id: response.data?.feedback_id || response.feedback_id,
        reviewer: 'Current User',
        email: localStorage.getItem('userEmail') || 'user@example.com',
        date: new Date().toISOString(),
        comment: newComment,
        resolved: false,
      };
      setFeedback([...feedback, comment]);
      setNewComment('');
      alert('Comment added successfully!');
    } catch (err) {
      alert('Failed to add comment: ' + err.message);
    }
  };

  const handleResolveComment = async (feedbackId) => {
    try {
      const currentFeedback = feedback.find((f) => f._id === feedbackId);
      await ResumesAPI.updateFeedback(id, feedbackId, {
        resolved: !currentFeedback.resolved,
      });

      setFeedback(
        feedback.map((f) =>
          f._id === feedbackId ? { ...f, resolved: !f.resolved } : f
        )
      );
    } catch (err) {
      alert('Failed to update comment: ' + err.message);
    }
  };

  const handleDeleteComment = async (feedbackId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await ResumesAPI.deleteFeedback(id, feedbackId);
        setFeedback(feedback.filter((f) => f._id !== feedbackId));
      } catch (err) {
        alert('Failed to delete comment: ' + err.message);
      }
    }
  };

  const handleRevokeShare = async () => {
    if (window.confirm('Revoke sharing? The link will no longer work.')) {
      try {
        await ResumesAPI.revokeShareLink(id);
        setShareLink('');
        setIsSharing(false);
        alert('Share link revoked successfully!');
      } catch (err) {
        alert('Failed to revoke share link: ' + err.message);
      }
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
