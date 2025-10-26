import React, { useState } from "react";

export default function CertificationForm({ addCert }) {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateEarned, setDateEarned] = useState("");
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [verified, setVerified] = useState(false);
  const [category, setCategory] = useState("");
  const [renewalReminder, setRenewalReminder] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("issuer", issuer);
    formData.append("date_earned", dateEarned);
    formData.append("does_not_expire", doesNotExpire);
    formData.append("expiration_date", doesNotExpire ? "" : expirationDate);
    formData.append("cert_number", certNumber);
    formData.append("verified", verified);
    formData.append("category", category);
    formData.append("renewal_reminder", renewalReminder);
    if (documentFile) formData.append("document_file", documentFile);

    addCert(formData);

    // Reset form
    setName(""); setIssuer(""); setDateEarned(""); setDoesNotExpire(false);
    setExpirationDate(""); setCertNumber(""); setDocumentFile(null);
    setVerified(false); setCategory(""); setRenewalReminder("");
  };

  return (
    <form onSubmit={handleSubmit} className="cert-form">
      <div>
        <input placeholder="Certification Name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div>
        <input placeholder="Issuer" value={issuer} onChange={e => setIssuer(e.target.value)} required />
      </div>

      <div>
        <label>Date Earned</label>
        <input type="date" value={dateEarned} onChange={e => setDateEarned(e.target.value)} required />
      </div>

      <div>
        <label>Expiration Date</label>
        {!doesNotExpire && (
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
        )}
        <label>
          <input type="checkbox" checked={doesNotExpire} onChange={e => setDoesNotExpire(e.target.checked)} />
          Does Not Expire
        </label>
      </div>

      <div>
        <input placeholder="Certification Number (Optional)" value={certNumber} onChange={e => setCertNumber(e.target.value)} />
      </div>

      <div>
        <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
      </div>

      <div>
      {!doesNotExpire && (
    <>
        <label>Renewal Reminder</label>
        <input type="date" value={renewalReminder} onChange={e => setRenewalReminder(e.target.value)} />
    </>
        )}
      </div>

      <div>
        <input type="file" onChange={e => setDocumentFile(e.target.files[0])} />
      </div>

      <div>
        <button type="submit">Add Certification</button>
      </div>
    </form>
  );
}
