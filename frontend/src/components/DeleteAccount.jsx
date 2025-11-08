import React, { useState } from 'react';

async function deleteCurrentUser() {
  // try {
  //   const response = await apiRequest("api/users/me", {
  //     method: "DELETE",
  //   });

  //   console.log("User deleted:", response);
  //   // Optionally clear local storage and redirect after delete
  //   localStorage.clear();
  //   window.location.href = "/login?deleted=true";
  // } catch (err) {
  //   console.error("Failed to delete user:", err);
  // }
}



const DeleteAccount = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [password, setPassword] = useState('');

  const handleDeleteClick = () => {
    setShowWarning(true);
  };

  const handleCancel = () => {
    setShowWarning(false);
    setPassword('');
  };

  const handleSubmit = () => {
    if (password.trim()) {
      // Call the delete_account function
      deleteCurrentUser();
    }
  };

  if (!showWarning) {
    return (
      <div style={{
        backgroundColor: '#F9FAFC', // Background Light
        padding: '18px', // Match Dashboard container padding
        borderRadius: '12px', // Match Dashboard container radius
        border: '1px solid #D1D5DB', // Divider Gray
        maxWidth: '400px',
        margin: '20px auto',
        boxSizing: 'border-box' // Consistent with CategoryCard
      }}>
        <button
          onClick={handleDeleteClick}
          style={{
            backgroundColor: '#E53935', // Error Red
            color: '#FFFFFF', // White
            border: 'none',
            padding: '12px 20px', // Consistent with other buttons
            borderRadius: '8px', // Match CategoryCard radius
            fontSize: '14px', // Match CategoryCard text size
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#00A67A'} // Teal Green hover (consistent with links)
          onMouseOut={(e) => e.target.style.backgroundColor = '#E53935'} // Back to Error Red
        >
          Delete Account
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#F9FAFC', // Background Light
      padding: '18px', // Match Dashboard container padding
      borderRadius: '12px', // Match Dashboard container radius
      border: '1px solid #E53935', // Error Red border for warning
      maxWidth: '400px',
      margin: '20px auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#E5E9EC', // Soft Gray (consistent with CategoryCard)
        padding: '10px', // Match CategoryCard padding
        borderRadius: '8px', // Match CategoryCard radius
        border: '1px solid #D1D5DB', // Divider Gray
        marginBottom: '12px', // Consistent spacing
        boxSizing: 'border-box'
      }}>
        <h3 style={{
          fontSize: '14px', // Match CategoryCard heading size
          fontWeight: '600',
          color: '#E53935', // Error Red
          marginBottom: '6px', // Match CategoryCard spacing
          textAlign: 'center'
        }}>
          ⚠️ Warning: Account Deletion
        </h3>
        
        <p style={{
          fontSize: '12px', // Match CategoryCard list text size
          color: '#0A0F1A', // Text Primary
          marginBottom: '4px', // Tight spacing like CategoryCard
          lineHeight: '1.3', // Match CategoryCard line height
          margin: 0
        }}>
          This action will <strong>permanently delete your account</strong> and all associated data.
        </p>
        
        <p style={{
          fontSize: '12px', // Match CategoryCard list text size
          color: '#0A0F1A', // Text Primary
          lineHeight: '1.3', // Match CategoryCard line height
          margin: '2px 0 0 0' // Minimal spacing like CategoryCard
        }}>
          <strong>This cannot be undone.</strong> All information will be removed immediately.
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px', // Match CategoryCard text size
          fontWeight: '600',
          color: '#0A0F1A', // Text Primary
          marginBottom: '4px' // Tight spacing
        }}>
          Enter your password to confirm:
        </label>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '8px', // Smaller, consistent padding
            border: '1px solid #D1D5DB', // Divider Gray
            borderRadius: '6px', // Slightly smaller radius
            fontSize: '12px', // Match CategoryCard text size
            boxSizing: 'border-box',
            color: '#0A0F1A', // Text Primary
            backgroundColor: '#FFFFFF' // Surface White
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '8px' // Smaller gap, consistent with spacing
      }}>
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: '#FFFFFF', // Surface White
            color: '#4A4A4A', // Text Secondary
            border: '1px solid #D1D5DB', // Divider Gray
            padding: '8px 12px', // Smaller, consistent padding
            borderRadius: '6px', // Match input radius
            fontSize: '12px', // Match CategoryCard text size
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#E5E9EC'} // Soft Gray hover
          onMouseOut={(e) => e.target.style.backgroundColor = '#FFFFFF'} // Back to Surface White
        >
          Cancel
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!password.trim()}
          style={{
            backgroundColor: password.trim() ? '#E53935' : '#D1D5DB', // Error Red or Divider Gray
            color: '#FFFFFF', // White
            border: 'none',
            padding: '8px 12px', // Smaller, consistent padding
            borderRadius: '6px', // Match input radius
            fontSize: '12px', // Match CategoryCard text size
            fontWeight: '600',
            cursor: password.trim() ? 'pointer' : 'not-allowed',
            flex: '1',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => {
            if (password.trim()) {
              e.target.style.backgroundColor = '#00A67A'; // Teal Green hover (consistent)
            }
          }}
          onMouseOut={(e) => {
            if (password.trim()) {
              e.target.style.backgroundColor = '#E53935'; // Back to Error Red
            }
          }}
        >
          Confirm Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;