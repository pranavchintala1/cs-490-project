import React, { useState } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";

const DUMMY_CERTS = [
  {
    id: "1",
    name: "AWS Certified Developer",
    category: "IT/Software",
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
    category: "IT/Software",
    issuer: "Meta",
    date_earned: "2022-06-20",
    expiration_date: "2025-11-15",
    does_not_expire: false,
    verified: false,
    has_document: false,
    cert_id: "META-67890"
  },
  {
    id: "3",
    name: "Python Fundamentals",
    category: "IT/Software",
    issuer: "Coursera",
    date_earned: "2021-09-15",
    does_not_expire: true,
    verified: true,
    has_document: true,
    document_name: "python_cert.pdf",
    cert_id: "COURSERA-11223"
  },
  {
    id: "4",
    name: "Agile Project Management",
    category: "Management",
    issuer: "PMI",
    date_earned: "2021-02-01",
    expiration_date: "2024-02-01",
    does_not_expire: false,
    verified: true,
    has_document: false,
    cert_id: "PMI-44556"
  }
];

export default function CertificationList() {
  const [certs, setCerts] = useState(DUMMY_CERTS);
  const [search, setSearch] = useState("");
  const [editCert, setEditCert] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
      });
  };

  const addCert = (formData) => {
    const newCert = {
      id: String(Date.now()),
      ...Object.fromEntries(formData.entries())
    };
    setCerts(sortCerts([...certs, newCert]));
    setShowForm(false);
    alert("✅ Certification added successfully!");
  };

  const submitEdit = (formData) => {
    const updatedCert = {
      ...editCert,
      ...Object.fromEntries(formData.entries())
    };
    setCerts(sortCerts(certs.map(c => c.id === updatedCert.id ? updatedCert : c)));
    setEditCert(null);
    setShowForm(false);
    alert("✅ Certification updated successfully!");
  };

  const deleteCert = (id) => {
    if (!window.confirm("Delete this certification?")) return;
    setCerts(sortCerts(certs.filter((c) => c.id !== id)));
    alert("✅ Certification deleted successfully!");
  };

  const filteredCerts = sortCerts(
    certs.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ margin: 0, color: "#333" }}>📜 Certifications</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditCert(null);
          }}
          style={{
            padding: "12px 24px",
            background: "#4f8ef7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {showForm ? "← Cancel" : "+ Add Certification"}
        </button>
      </div>

      {showForm && (
        <CertificationForm
          addCert={addCert}
          editCert={editCert ? { ...editCert, submit: submitEdit } : null}
          cancelEdit={() => {
            setEditCert(null);
            setShowForm(false);
          }}
        />
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="🔍 Search certifications by name, issuer, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxSizing: "border-box"
          }}
        />
      </div>

      {filteredCerts.length === 0 ? (
        <div style={{
          background: "#f9f9f9",
          padding: "40px",
          borderRadius: "8px",
          textAlign: "center",
          color: "#999"
        }}>
          <p style={{ fontSize: "16px" }}>
            {search ? "No certifications match your search" : "No certifications yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div>
          {filteredCerts.map((c) => (
            <CertificationCard
              key={c.id}
              cert={c}
              onDelete={deleteCert}
              onEdit={(cert) => {
                setEditCert(cert);
                setShowForm(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}