import { useCallback, useEffect, useState } from "react";
import { getMe, updateMe } from "../tools/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", location: "",
    headline: "", industry: "", experience_level: "", bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr(""); setMsg("");
    try {
      const me = await getMe();
      setProfile(me);
      setForm({
        full_name: me.full_name || "",
        email: me.email || "",
        phone: me.phone || "",
        location: me.location || "",
        headline: me.headline || "",
        industry: me.industry || "",
        experience_level: me.experience_level || "",
        bio: me.bio || "",
      });
    } catch (e) {
      setErr(e.message || "Failed to load profile.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(""); setMsg("");
    try {
      const patch = {
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone || "",
        location: form.location || "",
        headline: form.headline || "",
        industry: form.industry || "",
        experience_level: form.experience_level || null,
        bio: form.bio || "",
      };
      const updated = await updateMe(patch);
      setProfile(updated);
      setMsg("Changes saved!");
    } catch (e) {
      setErr(e.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 840, margin: "24px auto" }}>
        <h1>My Profile</h1>
        <div style={{ height: 220, borderRadius: 12, background: "#eee" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: "24px auto" }}>
      <h1>My Profile</h1>
      {msg && <div style={{ color: "green", marginBottom: 8 }}>{msg}</div>}
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      <form onSubmit={onSave} style={{ display: "grid", gap: 16 }}>
        <Row>
          <Field label="Full Name">
            <input name="full_name" value={form.full_name} onChange={onChange} />
          </Field>
          <Field label="Email">
            <input name="email" value={form.email} onChange={onChange} />
          </Field>
        </Row>

        <Row>
          <Field label="Phone"><input name="phone" value={form.phone} onChange={onChange} /></Field>
          <Field label="Location"><input name="location" value={form.location} onChange={onChange} /></Field>
        </Row>

        <Row>
          <Field label="Headline"><input name="headline" value={form.headline} onChange={onChange} /></Field>
          <Field label="Industry"><input name="industry" value={form.industry} onChange={onChange} /></Field>
        </Row>

        <Row>
          <Field label="Experience Level">
            <select name="experience_level" value={form.experience_level} onChange={onChange}>
              <option value="">(select)</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </Field>
          <Field label="Bio">
            <textarea name="bio" value={form.bio} onChange={onChange} rows={4} />
          </Field>
        </Row>

        <button disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
      <style jsx>{`
        input, select, textarea {
          padding: 8px 10px; border: 1px solid #ccc; border-radius: 8px; font: inherit;
        }
        textarea { resize: vertical; }
      `}</style>
    </label>
  );
}
