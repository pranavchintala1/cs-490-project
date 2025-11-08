import React, { useState, useEffect } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";
import { apiRequest } from "../../api";
import { useLocation } from "react-router-dom";

export default function CertificationList() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");
  const [editCert, setEditCert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get these once at component level
  const uuid = localStorage.getItem('uuid') || '';
  const token = localStorage.getItem('session') || '';
  const baseURL = 'http://localhost:8000';

  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      // Pass uuid as the 'id' parameter so api.js appends it correctly
      const data = await apiRequest(`/api/certifications/me?uuid=`, uuid);

      const transformedCerts = await Promise.all((data || []).map(async cert => {
        let hasDocument = false;
        let mediaId = null;

        try {
          // Pass uuid as 'id' parameter
          const mediaIdsResponse = await apiRequest(`/api/certifications/media/ids?parent_id=${cert._id}&uuid=`, uuid);
          const mediaIds = mediaIdsResponse.media_id_list || [];
          
          if (mediaIds.length > 0) {
            hasDocument = true;
            mediaId = mediaIds[0];
          }
        } catch (error) {
          console.error("Error fetching media for cert:", cert._id, error);
        }

        return {
          id: cert._id,
          name: cert.name,
          category: cert.category,
          issuer: cert.issuer,
          date_earned: cert.date_earned,
          expiration_date: cert.date_expiry,
          does_not_expire: !cert.date_expiry,
          verified: cert.verified || false,
          has_document: hasDocument,
          media_id: mediaId,
          cert_id: cert.cert_number,
          document_name: cert.document_name
        };
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
      const documentFile = formData.get('document');

      const backendData = {
        name: certData.name,
        issuer: certData.issuer,
        date_earned: certData.date_earned,
        date_expiry: certData.does_not_expire === 'true' ? null : certData.expiration_date,
        cert_number: certData.cert_number,
        category: certData.category,
        verified: certData.verified === 'true',
        document_name: documentFile && documentFile.size > 0 ? documentFile.name : null
      };

      // For POST requests, api.js doesn't append uuid, so include it in endpoint
      const response = await apiRequest(`/api/certifications?uuid=${uuid}`, "", {
        method: "POST",
        body: JSON.stringify(backendData)
      });

      if (documentFile && documentFile.size > 0) {
        const certificationId = response.certification_id;
        const uploadFormData = new FormData();
        uploadFormData.append('media', documentFile);

        const uploadResponse = await fetch(
          `${baseURL}/api/certifications/media?parent_id=${certificationId}&uuid=${uuid}`,
          {
            method: "POST",
            headers: {
              ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: uploadFormData
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload failed - Status:", uploadResponse.status);
          console.error("Response:", errorText);
          throw new Error(`Failed to upload document: ${uploadResponse.status}`);
        }
        
        console.log("File uploaded successfully!");
      }

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
      const documentFile = formData.get('document');

      const backendData = {
        name: certData.name,
        issuer: certData.issuer,
        date_earned: certData.date_earned,
        date_expiry: certData.does_not_expire === 'true' ? null : certData.expiration_date,
        cert_number: certData.cert_number,
        category: certData.category,
        verified: certData.verified === 'true'
      };

      if (documentFile && documentFile.size > 0) {
        backendData.document_name = documentFile.name;
      }

      // For PUT requests, pass uuid as 'id' parameter to let api.js append it
      await apiRequest(`/api/certifications?certification_id=${editCert.id}&uuid=`, uuid, {
        method: "PUT",
        body: JSON.stringify(backendData)
      });

      if (documentFile && documentFile.size > 0) {
        // Pass uuid as 'id' parameter
        const mediaIdsResponse = await apiRequest(`/api/certifications/media/ids?parent_id=${editCert.id}&uuid=`, uuid);
        const existingMediaIds = mediaIdsResponse.media_id_list || [];

        const uploadFormData = new FormData();
        uploadFormData.append('media', documentFile);

        if (existingMediaIds.length > 0) {
          const mediaId = existingMediaIds[0];
          const updateResponse = await fetch(
            `${baseURL}/api/certifications/media?parent_id=${editCert.id}&media_id=${mediaId}&uuid=${uuid}`,
            {
              method: "PUT",
              headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              body: uploadFormData
            }
          );

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Update failed:", errorText);
            throw new Error("Failed to update document");
          }
        } else {
          const uploadResponse = await fetch(
            `${baseURL}/api/certifications/media?parent_id=${editCert.id}&uuid=${uuid}`,
            {
              method: "POST",
              headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              body: uploadFormData
            }
          );

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Upload failed:", errorText);
            throw new Error("Failed to upload document");
          }
        }
      }

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
      // For DELETE requests, pass uuid as 'id' parameter to let api.js append it
      await apiRequest(`/api/certifications?certification_id=${id}&uuid=`, uuid, {
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
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
              paddingTop: "20px"
            }}>
              {filteredCerts.map((c) => (
                <CertificationCard
                  key={c.id}
                  cert={c}
                  onDelete={deleteCert}
                  onEdit={(cert) => {
                    setEditCert(cert);
                    setShowForm(true);
                  }}
                  onMediaDelete={loadCertifications}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}