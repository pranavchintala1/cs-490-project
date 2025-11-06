import React from "react";

export default function CertificationCard({ cert, onDelete, onEdit }) {
  const today = new Date();
  const expDate = cert.expiration_date ? new Date(cert.expiration_date) : null;
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
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/certifications/download/${encodeURIComponent(cert.id)}?user_id=temp_user`
      );
      if (!response.ok) return alert("File not found");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = cert.document_name || "document";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading file");
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
            {new Date(cert.date_earned).toLocaleDateString()}
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
            <strong style={{ color: "#333" }}>Expires:</strong>{" "}
            {cert.does_not_expire
              ? "Does not expire"
              : expDate
              ? new Date(cert.expiration_date).toLocaleDateString()
              : "-"}
          </div>
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
          borderTop: "1px solid #eee"
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