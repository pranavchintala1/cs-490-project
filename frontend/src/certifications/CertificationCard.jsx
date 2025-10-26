import React from "react";

export default function CertificationCard({ cert, onDelete, onToggleVerified }) {
  const today = new Date().toISOString().split("T")[0];
  const expired = cert.expiration_date && cert.expiration_date < today;

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "8px", marginBottom: "8px" }}>
      <strong>{cert.name}</strong> ({cert.category})<br />
      {cert.issuer} | Earned: {cert.date_earned} | {cert.does_not_expire ? "Does not expire" : `Expires: ${cert.expiration_date || "-"}`}<br />
      {cert.cert_number && <span>Cert #: {cert.cert_number}</span>}<br />
      Verified: <span style={{ color: cert.verified ? "green" : "red" }}>{cert.verified ? "✅" : "❌"}</span>
      <button onClick={() => onToggleVerified(cert)}>Toggle</button><br />
      {cert.renewal_reminder && <span>Renewal Reminder: {cert.renewal_reminder}</span>}<br />
      {cert.document_filename && <a href={`/${cert.document_filename}`} target="_blank" rel="noreferrer">View Document</a>}<br />
      <button onClick={() => onDelete(cert.id)}>🗑 Delete</button>
      {expired && <span style={{ color: "red", marginLeft: "8px" }}>Expired</span>}
    </div>
  );
}
