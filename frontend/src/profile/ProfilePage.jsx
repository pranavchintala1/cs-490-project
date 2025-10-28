// src/profile/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getUserProfile, updateUserProfile, uploadProfilePicture } from "../api";

const MAX_BIO = 500;
const USER_ID = "temp_user";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");


  useEffect(() => {
    (async () => {
      try {
        const p = await getUserProfile(USER_ID);
        setProfile(p);
      } catch (e) {
        console.error(e);
        setMsg("Failed to load profile.");
      }
    })();
  }, []);

  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:8000",
    []
  );




  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio") {
      setProfile((p) => ({ ...p, bio: (value || "").slice(0, MAX_BIO) }));
    } else {
       setProfile((p) => ({ ...p, [name]: value }));
    }
  };

    const validate = () => {
    if (!profile) return "Profile not loaded.";
    if ((profile.email || "").trim()) {
  
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
      if (!ok) return "This isnt valid please enter a valid email";
    }
    return "";
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      setMsg(err);
      return;
    }
    try {
      setSaving(true);
      setMsg("Saving…");
      const updated = await updateUserProfile(USER_ID, {
        full_name: profile.full_name || "",
        email: (profile.email || "").toLowerCase(),
        phone: profile.phone || "",
        location: profile.location || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        industry: profile.industry || "",
        experience_level: profile.experience_level || null,
        profile_picture: profile.profile_picture || "",
      });
      setProfile(updated);
      setMsg("Saved!");
    } catch (e) {
      console.error(e);
      setMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  };

   const onUpload = async () => {
    if (!file) {
      setMsg("Choose an image first.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Image must be 5MB or smaller.");
      return;
    }
    try {
      setUploading(true);
      setMsg("Uploading…");
       const { url } = await uploadProfilePicture(USER_ID, file);
      
      const updated = await updateUserProfile(USER_ID, { profile_picture: url });
      setProfile(updated);
      setMsg("Uploaded!");
    } catch (e) {
      console.error(e);
      setMsg("Upload failed. :(");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  if (!profile) return <p style={{ padding: 16 }}>Loading…</p>;

  return (
    <div className="profile-container" style={styles.container}>
      <h2 style={styles.h2}>My Profile</h2>

      <div style={styles.grid}>
        <L label="Full Name">
          <input
            name="full_name"
            value={profile.full_name || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="Full Name"
          />
        </L>

        <L label="Email">
          <input
            type="email"
            name="email"
            value={profile.email || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="email@domain.com"
          />
        </L>

        <L label="Phone">
          <input
            name="phone"
            value={profile.phone || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="(555) 555-5555"
          />
        </L>

        <L label="Location">
          <input
            name="location"
            value={profile.location || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="City, State"
          />
        </L>

        <L label="Headline">
          <input
            name="headline"
            value={profile.headline || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="e.g., Full-Stack Developer"
          />
        </L>

        <L label="Industry">
          <input
            name="industry"
            value={profile.industry || ""}
            onChange={onChange}
            style={styles.input}
            placeholder="e.g., Software, Finance"
          />
        </L>

        <L label="Experience Level">
          <select
            name="experience_level"
            value={profile.experience_level || ""}
            onChange={onChange}
            style={styles.input}
          >
            <option value="">Select…</option>
            <option>Entry</option>
            <option>Mid</option>
            <option>Senior</option>
            <option>Executive</option>
          </select>
        </L>

        <L label={`Bio (${(profile.bio || "").length}/${MAX_BIO})`}>
          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={onChange}
            rows={4}
            style={{ ...styles.input, resize: "vertical" }}
            placeholder="Brief professional summary (max 500 chars)"
          />
        </L>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={saving || uploading} style={styles.btn}>
          {saving ? "Saving…" : "Save"}
        </button>
        <span style={{ color: "#555" }}>{msg}</span>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h3>Upload Profile Picture</h3>
      {profile.profile_picture ? (
        <img
          alt="profile"
          src={`${apiBase}${profile.profile_picture}`}
          style={{ maxWidth: 160, borderRadius: 8, display: "block", marginBottom: 12 }}
        />
      ) : (
        <p style={{ color: "#666" }}>No picture uploaded yet.</p>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={onUpload} disabled={uploading || !file} style={styles.btn}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}

function L({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

/* ---------- minimal styles ---------- */
const styles = {
  container: { padding: 16, maxWidth: 720, fontFamily: "system-ui, sans-serif" },
  h2: { marginTop: 0 },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr 1fr",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 8,
    width: "100%",
  },
  btn: {
    padding: "8px 14px",
    border: "1px solid #bbb",
    borderRadius: 8,
    cursor: "pointer",
    background: "#fff",
  },
};
