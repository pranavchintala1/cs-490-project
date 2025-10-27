import React, { useState } from "react";

export default function CertificationForm({ addCert }) {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateEarned, setDateEarned] = useState("");
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [category, setCategory] = useState("Categories");

  const categories = [
    "Categories", "IT/Software", "Healthcare", "Finance", "Management", "Engineering",
    "Education", "Safety", "Legal", "Design", "Marketing", "Other"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("issuer", issuer);
    formData.append("date_earned", dateEarned);
    formData.append("does_not_expire", doesNotExpire);
    formData.append("expiration_date", doesNotExpire ? "" : expirationDate);
    formData.append("cert_id", certNumber);
    formData.append("category", category);
    if (documentFile) formData.append("document", documentFile);

    addCert(formData);

    // Reset form
    setName(""); setIssuer(""); setDateEarned(""); setDoesNotExpire(false);
    setExpirationDate(""); setCertNumber(""); setDocumentFile(null); setCategory("Categories");
  };

  return (
    <form onSubmit={handleSubmit} className="cert-form">
      <div><input placeholder="Certification Name" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><input placeholder="Issuer" value={issuer} onChange={e => setIssuer(e.target.value)} required /></div>
      <div>
        <label>Date Earned</label>
        <input type="date" value={dateEarned} onChange={e => setDateEarned(e.target.value)} required />
      </div>
      <div>
        {!doesNotExpire && (
          <>
            <label>Expiration Date</label>
            <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
          </>
        )}
        <label>
          <input type="checkbox" checked={doesNotExpire} onChange={e => setDoesNotExpire(e.target.checked)} />
          Does Not Expire
        </label>
      </div>
      <div><input placeholder="Certification Number/ID" value={certNumber} onChange={e => setCertNumber(e.target.value)} /></div>
      <div>
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <input type="file" onChange={e => setDocumentFile(e.target.files[0])} />
      </div>
      <div><button type="submit">Add Certification</button></div>
    </form>
  );
}
