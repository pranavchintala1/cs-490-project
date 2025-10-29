import React, { useEffect, useState } from "react";
import CertificationForm from "./CertificationForm";
import CertificationCard from "./CertificationCard";

const API_URL = process.env.REACT_APP_API_URL + "/certifications";

export default function CertificationList() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCerts = async () => {
    const res = await fetch(`${API_URL}?user_id=temp_user`);
    const data = await res.json();
    setCerts(sortCerts(data || []));
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const sortCerts = (certArray) => {
    const today = new Date();
    return certArray
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
      .map((c, i) => ({ ...c, position: i })); // recalc position
  };

  const addCert = async (formData) => {
    formData.append("user_id", "temp_user");
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const added = await res.json();
    setCerts(sortCerts([...certs, added]));
  };

  const deleteCert = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    await fetch(`${API_URL}/${id}?user_id=temp_user`, { method: "DELETE" });
    setCerts(sortCerts(certs.filter((c) => c.id !== id)));
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
        <CertificationCard key={c.id} cert={c} onDelete={deleteCert} />
      ))}
    </div>
  );
}
