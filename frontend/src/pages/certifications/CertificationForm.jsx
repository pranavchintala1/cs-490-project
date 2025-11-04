import React, { useState, useRef, useEffect } from "react";

export default function CertificationForm({ addCert, editCert, cancelEdit }) {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateEarned, setDateEarned] = useState("");
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [category, setCategory] = useState("");
  const [verified, setVerified] = useState(false);
  const [id, setId] = useState(null);

  const fileInputRef = useRef(null); 

  const categories = [
    "IT/Software", "Healthcare", "Finance", "Management", "Engineering",
    "Education", "Safety", "Legal", "Design", "Marketing", "Other"
  ];

  useEffect(() => {
    if (editCert) {
      setName(editCert.name || "");
      setIssuer(editCert.issuer || "");
      setDateEarned(editCert.date_earned || "");
      setDoesNotExpire(editCert.does_not_expire || false);
      setExpirationDate(editCert.expiration_date || "");
      setCertNumber(editCert.cert_id || "");
      setCategory(editCert.category || "");
      setVerified(editCert.verified || false);
      setId(editCert.id);
    } else {
      resetForm();
    }
  }, [editCert]);

  const resetForm = () => {
    setName(""); setIssuer(""); setDateEarned(""); setDoesNotExpire(false);
    setExpirationDate(""); setCertNumber(""); setDocumentFile(null); setCategory(""); setVerified(false);
    setId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Please enter certification name");
    if (!issuer.trim()) return alert("Please enter issuing organization");
    if (!dateEarned) return alert("Please select date earned");
    if (!doesNotExpire && !expirationDate) return alert("Please select expiration date or mark as does not expire");
    if (!certNumber.trim()) return alert("Please enter certification number/ID");
    if (!category) return alert("Please select a certification category");

    const formData = new FormData();
    formData.append("id", id || `cert${Date.now()}`);
    formData.append("name", name.trim());
    formData.append("issuer", issuer.trim());
    formData.append("date_earned", dateEarned);
    formData.append("does_not_expire", doesNotExpire);
    formData.append("expiration_date", doesNotExpire ? "" : expirationDate);
    formData.append("cert_id", certNumber.trim());
    formData.append("category", category);
    formData.append("verified", verified);
    if (documentFile) formData.append("document", documentFile);

    if (editCert) {
      editCert.submit(formData);
    } else {
      addCert(formData);
    }

    resetForm();
    cancelEdit && cancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="cert-form">
      <h3>{editCert ? "Edit Certification" : "Add Certification"}</h3>
      <input placeholder="Certification Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Issuer" value={issuer} onChange={e => setIssuer(e.target.value)} required />
      <label>Date Earned</label>
      <input type="date" value={dateEarned} onChange={e => setDateEarned(e.target.value)} required />

      {!doesNotExpire && (
        <>
          <label>Expiration Date</label>
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} required={!doesNotExpire} />
        </>
      )}
      <label>
        <input type="checkbox" checked={doesNotExpire} onChange={e => setDoesNotExpire(e.target.checked)} />
        Does Not Expire
      </label>

      <input placeholder="Certification Number/ID" value={certNumber} onChange={e => setCertNumber(e.target.value)} required />
      <select value={category} onChange={e => setCategory(e.target.value)} required>
        <option value="" disabled>Select Industry</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <label>
        <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />
        Verified by Reviewer
      </label>

      <input ref={fileInputRef} type="file" onChange={e => setDocumentFile(e.target.files[0])} />

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button type="submit">{editCert ? "Save" : "Add Certification"}</button>
        <button type="button" onClick={() => { resetForm(); cancelEdit && cancelEdit(); }}>Cancel</button>
      </div>
    </form>
  );
}
