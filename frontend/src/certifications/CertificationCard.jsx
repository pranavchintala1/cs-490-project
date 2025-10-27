import React from "react";

export default function CertificationCard({ cert, onDelete }) {
  const today = new Date();
  const expDate = cert.expiration_date ? new Date(cert.expiration_date) : null;
  const expiringSoon = expDate && (expDate - today <= 1000 * 60 * 60 * 24 * 90); // 90 days
  const expired = expDate && expDate < today;

  let bgColor = "#fff";
  let warningText = "";

  if (expired) {
    bgColor = "#a43333ff"; // soft red
    warningText = "❌ Expired";
  } else if (expiringSoon) {
    bgColor = "#e08f38ff"; // soft orange
    warningText = "⚠️ Expiring Soon";
  }

  return (
    <div style={{ backgroundColor: bgColor, borderRadius: "4px", padding: "8px", marginBottom: "8px" }}>
      {warningText && <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{warningText}</div>}
      <strong>{cert.name}</strong> ({cert.category})<br />
      {cert.issuer} | Earned: {cert.date_earned} | {cert.does_not_expire ? "Does not expire" : `Expires: ${cert.expiration_date || "-"}`}<br />
      {cert.cert_id && <span>Cert #: {cert.cert_id}</span>}<br />
      Verified: <span style={{ color: cert.verified ? "green" : "red" }}>{cert.verified ? "✅" : "❌"}</span><br />
    {cert.document_url && (
  <span
    style={{
      color: "blue",
      textDecoration: "underline",
      cursor: "pointer",
      marginTop: "4px",
      display: "inline-block"
    }}
    onClick={async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/certifications/download/${encodeURIComponent(cert.document_url)}`);
        if (!response.ok) return alert("File not found");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = cert.document_url; // keeps original filename
        link.click();

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert("Error downloading file");
      }
    }}
  >
    📄 Download Document
  </span>
)}

      <br />
      <button onClick={() => onDelete(cert.id)}>🗑 Delete</button>
    </div>
  );
}
