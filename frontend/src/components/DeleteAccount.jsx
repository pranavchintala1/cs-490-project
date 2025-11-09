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
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [password, setPassword] = useState('');

  const handleDeleteClick = () => {
    setShowWarning(true);
  };

  const handleCancel = () => {
    setShowWarning(false);
    setPassword('');
  };

  // const handleSubmit = async () => {
  //   if (password.trim()) {
  //     try {
  //       const result = await ProfileApi.delete({ password: password });
        
  //       if (result === true) {
  //         // Delete successful, now logout
  //         try {
  //           await AuthAPI.logout();
  //           showFlash("Successfully Logged out", "success");
  //         } catch (error) {
  //           showFlash(error.detail, "error");
  //           console.error("Logout failed:", error);
  //         }
          
  //         localStorage.removeItem("uuid");
  //         localStorage.removeItem("session");
  //         navigate("/");
  //       } else {
  //         // Delete failed - invalid password
  //         setPassword('');
  //         showFlash("Invalid password", "error");
  //       }
  //     } catch (error) {
  //       // Handle any errors from the delete call
  //       setPassword('');
  //       showFlash("Invalid password", "error");
  //       console.error("Delete failed:", error);
  //     }
  //   }
  // };

  if (!showWarning) {
    return (
      <div style={{
        backgroundColor: '#F9FAFC',
        padding: '18px',
        borderRadius: '12px',
        border: '1px solid #D1D5DB',
        maxWidth: '400px',
        margin: '20px auto',
        boxSizing: 'border-box'
      }}>
        <button
          onClick={handleDeleteClick}
          style={{
            backgroundColor: '#E53935',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#00A67A'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#E53935'}
        >
          Delete Account
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#F9FAFC',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #E53935',
      maxWidth: '400px',
      margin: '20px auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#E5E9EC',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        marginBottom: '12px',
        boxSizing: 'border-box'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#E53935',
          marginBottom: '6px',
          textAlign: 'center'
        }}>
          ⚠️ Warning: Account Deletion
        </h3>
        
        <p style={{
          fontSize: '12px',
          color: '#0A0F1A',
          marginBottom: '4px',
          lineHeight: '1.3',
          margin: 0
        }}>
          This action will <strong>permanently delete your account</strong> and all associated data.
        </p>
        
        <p style={{
          fontSize: '12px',
          color: '#0A0F1A',
          lineHeight: '1.3',
          margin: '2px 0 0 0'
        }}>
          <strong>This cannot be undone.</strong> All information will be removed immediately.
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '600',
          color: '#0A0F1A',
          marginBottom: '4px'
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
            padding: '8px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '12px',
            boxSizing: 'border-box',
            color: '#0A0F1A',
            backgroundColor: '#FFFFFF'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#4A4A4A',
            border: '1px solid #D1D5DB',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#E5E9EC'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#FFFFFF'}
        >
          Cancel
        </button>
        
        <button
          // onClick={handleSubmit}
          disabled={!password.trim()}
          style={{
            backgroundColor: password.trim() ? '#E53935' : '#D1D5DB',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: password.trim() ? 'pointer' : 'not-allowed',
            flex: '1',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => {
            if (password.trim()) {
              e.target.style.backgroundColor = '#00A67A';
            }
          }}
          onMouseOut={(e) => {
            if (password.trim()) {
              e.target.style.backgroundColor = '#E53935';
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