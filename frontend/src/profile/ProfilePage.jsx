// src/profile/ProfilePage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfileById,
  uploadProfilePicture,
} from "../api";

const styles = {
  input: { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  label: { display: "block", fontWeight: 600, marginBottom: 6 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 },
};

export default function ProfilePage({ userId = "temp_user" }) {
  const [profile, setProfile] = useState(null);          // will include { id, user_id, ... }
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", location: "",
    headline: "", industry: "", experience_level: "", bio: "", profile_picture: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = await getUserProfile(userId); // GET /profile/?user_id=...
      setProfile(p);
      setForm((f) => ({
        ...f,
        full_name: p.full_name || "",
        email: p.email || "",
        phone: p.phone || "",
        location: p.location || "",
        headline: p.headline || "",
        industry: p.industry || "",
        experience_level: p.experience_level || "",
        bio: p.bio || "",
        profile_picture: p.profile_picture || null,
      }));
    } catch (e) {
      setError(e.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (profile?.id) {
        const updated = await updateUserProfileById(userId, profile.id, form);
        setProfile(updated);
      } else {
        const created = await createUserProfile({ user_id: userId, ...form });
        setProfile(created);
      }
      alert("Profile saved!");
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const updated = await uploadProfilePicture(userId, file); // returns full profile
      setProfile(updated);
      setForm((f) => ({ ...f, profile_picture: updated.profile_picture || null }));
    } catch (e) {
      setError("Upload failed. :(");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <h1>My Profile</h1>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <form onSubmit={onSave}>
        <div style={styles.row}>
          <div>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} name="full_name" value={form.full_name} onChange={onChange}/>
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" value={form.email} onChange={onChange}/>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Phone</label>
            <input style={styles.input} name="phone" value={form.phone} onChange={onChange}/>
          </div>
          <div>
            <label style={styles.label}>Location</label>
            <input style={styles.input} name="location" value={form.location} onChange={onChange}/>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Headline</label>
            <input style={styles.input} name="headline" value={form.headline} onChange={onChange}/>
          </div>
          <div>
            <label style={styles.label}>Industry</label>
            <input style={styles.input} name="industry" value={form.industry} onChange={onChange}/>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Experience Level</label>
            <select
              style={styles.input}
              name="experience_level"
              value={form.experience_level || ""}
              onChange={onChange}
            >
              <option value="">(select)</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              style={{ ...styles.input, resize: "vertical", minHeight: 100 }}
            />
          </div>
        </div>

        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </form>

      <hr style={{ margin: "24px 0" }} />

      <h2>Upload Profile Picture</h2>
      {form.profile_picture ? (
        <div style={{ marginBottom: 12 }}>
          <img
            src={`${apiBase}${form.profile_picture}`}
            alt="profile"
            style={{ maxWidth: 200, borderRadius: 8 }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>No picture uploaded yet.</div>
      )}
      <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading}/>
      {uploading && <div>Uploading…</div>}
    </div>
  );
}
