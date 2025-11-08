import React from "react";

export default function CertificationCard({ cert, onDelete, onEdit }) {
  // Helper function to parse date string as local date without timezone issues
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison
  
  const expDate = cert.expiration_date ? parseLocalDate(cert.expiration_date) : null;
  const expiringSoon = expDate && (expDate - today <= 1000 * 60 * 60 * 24 * 90); 
  const expired = expDate && expDate < today;

  let bgColor = "white";
  let borderColor = "#ddd";
  let warningBadge = null;

  if (expired) {
    bgColor = "#ffebee";
    borderColor = "#f44336";
    warningBadge = { text: "❌ Expired", color: "#f44336" };
  } else if (expiringSoon) {
    bgColor = "#fff3e0";
    borderColor = "#ff9800";
    warningBadge = { text: "⚠️ Expiring Soon", color: "#ff9800" };
  }

  const handleDownload = async () => {
    if (!cert.media_id) {
      alert("No document available");
      return;
    }

    try {
      // Get auth details
      const uuid = localStorage.getItem('uuid') || '';
      const token = localStorage.getItem('session') || '';
      const baseURL = 'http://localhost:8000';
      
      const response = await fetch(
        `${baseURL}/api/certifications/media?media_id=${cert.media_id}&uuid=${uuid}`,
        {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        }
      );
      
      if (!response.ok) {
        alert("File not found or error downloading");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'certificate-document';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading file");
    }
  };

  const handleDeleteMedia = async () => {
    if (!cert.media_id) {
      alert("No document to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      return;
    }

    try {
      const uuid = localStorage.getItem('uuid') || '';
      const token = localStorage.getItem('session') || '';
      const baseURL = 'http://localhost:8000';
      
      const response = await fetch(
        `${baseURL}/api/certifications/media?media_id=${cert.media_id}&uuid=${uuid}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        }
      );
      
      if (!response.ok) {
        alert("Failed to delete document");
        return;
      }

      alert("Document deleted successfully!");
      // Reload the page to refresh the certifications list
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting document");
    }
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.2s",
        position: "relative"
      }}
    >
      {warningBadge && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: warningBadge.color,
          color: "white",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "700"
        }}>
          {warningBadge.text}
        </div>
      )}

      <div style={{ paddingRight: warningBadge ? "120px" : "0" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px"
        }}>
          <span style={{ fontSize: "24px" }}>📜</span>
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            color: "#333"
          }}>
            {cert.name}
          </h3>
        </div>

        <div style={{
          display: "inline-block",
          background: "#e3f2fd",
          color: "#1976d2",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          marginBottom: "12px"
        }}>
          {cert.category}
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
            <strong style={{ color: "#333" }}>Issuer:</strong> {cert.issuer}
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
            <strong style={{ color: "#333" }}>Earned:</strong>{" "}
            {formatDate(cert.date_earned)}
          </div>
          {!cert.does_not_expire && (
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
              <strong style={{ color: "#333" }}>Expires:</strong>{" "}
              {formatDate(cert.expiration_date)}
            </div>
          )}
          {cert.cert_id && (
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
              <strong style={{ color: "#333" }}>Cert #:</strong> {cert.cert_id}
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
          paddingTop: "8px",
          borderTop: "1px solid #eee",
          flexWrap: "wrap"
        }}>
          <div style={{ fontSize: "13px" }}>
            <strong style={{ color: "#333" }}>Verified:</strong>{" "}
            <span style={{
              color: cert.verified ? "#34c759" : "#ff3b30",
              fontWeight: "600"
            }}>
              {cert.verified ? "✅ Yes" : "❌ No"}
            </span>
          </div>

          {cert.has_document && (
            <>
              <button
                onClick={handleDownload}
                style={{
                  padding: "4px 12px",
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                📄 Download
              </button>
              <button
                onClick={handleDeleteMedia}
                style={{
                  padding: "4px 12px",
                  background: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                🗑️ Delete Doc
              </button>
            </>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "10px",
          paddingTop: "8px",
          borderTop: "1px solid #eee"
        }}>
          <button
            onClick={() => onEdit(cert)}
            style={{
              padding: "8px 16px",
              background: "#34c759",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(cert.id)}
            style={{
              padding: "8px 16px",
              background: "#ff3b30",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}