import React, { useState, useEffect } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";
import { apiRequest } from "../../api";

export default function CertificationList() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");
  const [editCert, setEditCert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/certifications/me?uuid=", "");
      
      // Transform backend data to frontend format
      const transformedCerts = (data || []).map(cert => ({
        id: cert._id,
        name: cert.name,
        category: cert.category,
        issuer: cert.issuer,
        date_earned: cert.date_earned,
        expiration_date: cert.date_expiry,
        does_not_expire: !cert.date_expiry,
        verified: cert.verified || false,
        has_document: cert.has_document || false,
        document_name: cert.document_name,
        cert_id: cert.cert_number
      }));
      
      setCerts(sortCerts(transformedCerts));
    } catch (error) {
      console.error("Failed to load certifications:", error);
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const addCert = async (formData) => {
    try {
      const certData = Object.fromEntries(formData.entries());
      
      // Transform frontend data to match backend schema exactly
      const backendData = {
        name: certData.name,
        issuer: certData.issuer,
        date_earned: certData.date_earned,
        date_expiry: certData.does_not_expire === 'true' ? null : certData.expiration_date,
        cert_number: certData.cert_number,
        category: certData.category,
        verified: certData.verified === 'true'
      };
      
      await apiRequest("/api/certifications?uuid=", "", {
        method: "POST",
        body: JSON.stringify(backendData)
      });

      // Reload certifications from server to get the actual data
      await loadCertifications();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add certification:", error);
      alert("Failed to add certification. Please try again.");
    }
  };

  const submitEdit = async (formData) => {
    try {
      const certData = Object.fromEntries(formData.entries());
      
      // Transform frontend data to match backend schema exactly
      const backendData = {
        name: certData.name,
        issuer: certData.issuer,
        date_earned: certData.date_earned,
        date_expiry: certData.does_not_expire === 'true' ? null : certData.expiration_date,
        cert_number: certData.cert_number,
        category: certData.category,
        verified: certData.verified === 'true'
      };
      
      await apiRequest(`/api/certifications?certification_id=${editCert.id}&uuid=`, "", {
        method: "PUT",
        body: JSON.stringify(backendData)
      });

      // Reload certifications from server to get the actual updated data
      await loadCertifications();
      setEditCert(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to update certification:", error);
      alert("Failed to update certification. Please try again.");
    }
  };

  const deleteCert = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    
    try {
      await apiRequest(`/api/certifications?certification_id=${id}&uuid=`, "", {
        method: "DELETE"
      });

      setCerts(sortCerts(certs.filter((c) => c.id !== id)));
    } catch (error) {
      console.error("Failed to delete certification:", error);
      alert("Failed to delete certification. Please try again.");
    }
  };

  const filteredCerts = sortCerts(
    certs.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "#333" }}>📜 Certifications</h1>
        <p>Loading certifications...</p>
      </div>
    );
  }

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

      {/* Only show the certification list if we're not showing the form */}
      {!showForm && (
        <>
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
        </>
      )}
    </div>
  );
}