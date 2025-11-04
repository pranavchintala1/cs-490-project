import React, { useState } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";

// Dummy data
const DUMMY_CERTS = [
  {
    id: "1",
    name: "AWS Certified Developer",
    category: "Cloud Computing",
    issuer: "Amazon Web Services",
    date_earned: "2023-03-10",
    expiration_date: "2026-03-10",
    does_not_expire: false,
    verified: true,
    has_document: true,
    document_name: "aws_cert.pdf",
    cert_id: "AWS-12345"
  },
  {
    id: "2",
    name: "React Developer Certification",
    category: "Frontend Development",
    issuer: "Meta",
    date_earned: "2022-06-20",
    expiration_date: "2025-11-15",
    does_not_expire: false,
    verified: false,
    has_document: false
  },
  {
    id: "3",
    name: "Python Fundamentals",
    category: "Programming",
    issuer: "Coursera",
    date_earned: "2021-09-15",
    does_not_expire: true,
    verified: true,
    has_document: true,
    document_name: "python_cert.pdf"
  },
  {
    id: "4",
    name: "Agile Project Management",
    category: "Project Management",
    issuer: "PMI",
    date_earned: "2021-02-01",
    expiration_date: "2024-02-01",
    does_not_expire: false,
    verified: true,
    has_document: false
  }
];

export default function CertificationList() {
  const [certs, setCerts] = useState(DUMMY_CERTS);
  const [search, setSearch] = useState("");

  // Sort certs: expired first, then expiring soon, then others
  const sortCerts = (certArray) => {
    const today = new Date();
    return certArray
      .map((c) => ({ ...c }))
      .sort((a, b) => {
        const aExp = a.expiration_date ? new Date(a.expiration_date) : null;
        const bExp = b.expiration_date ? new Date(b.expiration_date) : null;

        const aExpired = aExp && aExp < today;
        const bExpired = bExp && bExp < today;

        const aExpSoon = aExp && aExp - today <= 1000 * 60 * 60 * 24 * 90;
        const bExpSoon = bExp && bExp - today <= 1000 * 60 * 60 * 24 * 90;

        if (aExpired && !bExpired) return -1;
        if (!aExpired && bExpired) return 1;
        if (aExpSoon && !bExpSoon) return -1;
        if (!aExpSoon && bExpSoon) return 1;
        return 0;
      })
      .map((c, i) => ({ ...c, position: i }));
  };

  const addCert = (formData) => {
    const newCert = {
      id: String(Date.now()),
      ...Object.fromEntries(formData.entries())
    };
    setCerts(sortCerts([...certs, newCert]));
  };

  const deleteCert = (id) => {
    if (!window.confirm("Delete this certification?")) return;
    setCerts(sortCerts(certs.filter((c) => c.id !== id)));
  };

  const filteredCerts = sortCerts(
  certs.filter((c) =>
    c.issuer?.toLowerCase().includes(search.toLowerCase())
  )
);


  return (
    <div>
      <h2 style={{ color: "#003366" }}>Certifications</h2>

      {/* Certification Form */}
      <CertificationForm addCert={addCert} />

      {/* Search */}
      <input
        placeholder="Search by issuer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          margin: "8px 0",
          padding: "6px 8px",
          borderRadius: "4px",
          border: "1px solid #D1D5DB"
        }}
      />

      {/* Certification List */}
      {filteredCerts.length === 0 && <p>No certifications found</p>}
      {filteredCerts.map((c) => (
        <CertificationCard key={c.id} cert={c} onDelete={deleteCert} />
      ))}
    </div>
  );
}
