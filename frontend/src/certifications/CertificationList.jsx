import React, { useEffect, useState } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";

const API_URL = "http://127.0.0.1:8000/certifications";

export default function CertificationList() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCerts = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setCerts(data || []);
  };

  useEffect(() => { fetchCerts(); }, []);

  const addCert = async (formData) => {
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const added = await res.json();
    setCerts([...certs, added]);
  };

  const deleteCert = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setCerts(certs.filter(c => c.id !== id));
  };

  const toggleVerified = async (cert) => {
    const updated = { ...cert, verified: !cert.verified };
    await fetch(`${API_URL}/${cert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setCerts(certs.map(c => c.id === cert.id ? updated : c));
  };

  const filteredCerts = certs.filter(c => c.issuer?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2>Certifications</h2>
      <CertificationForm addCert={addCert} />
      <input
        placeholder="Search by issuer..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ margin: "8px 0", padding: "4px" }}
      />
      {filteredCerts.length === 0 && <p>No certifications found</p>}
      {filteredCerts.map(c => (
        <CertificationCard
          key={c.id}
          cert={c}
          onDelete={deleteCert}
          onToggleVerified={toggleVerified}
        />
      ))}
    </div>
  );
}
