import React, { useEffect, useState } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";

const API_URL = process.env.REACT_APP_API_URL + "/certifications";

export default function CertificationList() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch certifications from backend
  const fetchCerts = async () => {
    const res = await fetch(`${API_URL}?user_id=temp_user`);
    const data = await res.json();
    setCerts(data || []);
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  // Add new certification
  const addCert = async (formData) => {
    formData.append("user_id", "temp_user"); // backend requires user_id
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });
    const added = await res.json();
    setCerts([...certs, added]);
  };

  // Delete certification
  const deleteCert = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    await fetch(`${API_URL}/${id}?user_id=temp_user`, { method: "DELETE" })
    setCerts(certs.filter((c) => c.id !== id));
  };

  const filteredCerts = certs.filter((c) =>
    c.issuer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Certifications</h2>
      <CertificationForm addCert={addCert} />

      <input
        placeholder="Search by issuer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: "8px 0", padding: "4px" }}
      />

      {filteredCerts.length === 0 && <p>No certifications found</p>}

      {filteredCerts.map((c) => (
        <CertificationCard
          key={c.id}
          cert={c}
          onDelete={deleteCert}
        />
      ))}
    </div>
  );
}
