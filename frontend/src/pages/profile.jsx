import { useEffect, useRef, useState } from "react";
import ProfilesAPI from "../api/profiles";
import DeleteAccount from "../components/DeleteAccount";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    address: "",
    title: "",
    biography: "",
    industry: "",
    experience_level: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const fileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await ProfilesAPI.get();
        const me = meRes.data;
        setProfile(me);
        setForm({
          username: me.username ?? "",
          email: me.email ?? "",
          full_name: me.full_name ?? "",
          phone_number: me.phone_number ?? "",
          address: me.address ?? "",
          title: me.title ?? "",
          biography: me.biography ?? "",
          industry: me.industry ?? "",
          experience_level: me.experience_level ?? "",
        });

        // Load avatar
        const res = await ProfilesAPI.getAvatar();
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        if (url) {
          setAvatarUrl(url);
        }
      } catch (e) {
        // setErr("Failed to load profile: " + (e.message || "Unknown error"));
        setProfile({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setSelectedFile(f || null);

    // Create local preview using FileReader
    if (f) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");

    try {

      const data = {
          username: form.username || null,
          email: form.email || null,
          full_name: form.full_name || null,
          phone_number: form.phone_number || "",
          address: form.address || "",
          title: form.title || "",
          biography: form.biography || "",
          industry: form.industry || "",
          experience_level: form.experience_level || null,
      };
      await ProfilesAPI.update(data);
      if (selectedFile) {
        await ProfilesAPI.uploadAvatar(selectedFile);
      }

      // Refetch the full profile to get the updated data
      const getRes = await ProfilesAPI.get();
      const updatedProfile = getRes.data;
      setProfile(updatedProfile);

      setMsg("Profile updated successfully!");

      // If user uploaded a new avatar, fetch it from backend
      if (selectedFile) {
        const res = await ProfilesAPI.getAvatar();
        const blob = res.data;
        const newAvatarUrl = URL.createObjectURL(blob);
        if (newAvatarUrl) {
          // Revoke old blob URL if it exists
          if (avatarUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(avatarUrl);
          }
          setAvatarUrl(newAvatarUrl);
        }
      }

      // Clear file selection UI after brief delay so save completes visually
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = "";
      }, 500);
    } catch (e) {
      setErr(e.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <h1>My Profile</h1>

      {msg && <div style={{ color: "green", marginTop: 8 }}>{msg}</div>}
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

      {/* Picture */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: 16,
          alignItems: "center",
          margin: "16px 0 24px",
        }}
      >
        <div>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 12 }}
            />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="pfp"
              style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 12 }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                background: "#eee",
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                color: "#666",
              }}
            >
              No picture
            </div>
          )}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} />
          {selectedFile && (
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Selected: <strong>{selectedFile.name}</strong>
            </div>
          )}
        </div>
      </section>

      {/* Form */}
      <form onSubmit={onSave} style={{ display: "grid", gap: 16 }}>
        <Row>
          <Field label="Username">
            <input name="username" value={form.username} onChange={onChange} />
          </Field>
          <Field label="Email">
            <input name="email" value={form.email} onChange={onChange} />
          </Field>
        </Row>

        <Row>
          <Field label="Full Name">
            <input name="full_name" value={form.full_name} onChange={onChange} />
          </Field>
          <Field label="Phone">
            <input name="phone_number" value={form.phone_number} onChange={onChange} />
          </Field>
        </Row>

        <Row>
          <Field label="Address">
            <input name="address" value={form.address} onChange={onChange} />
          </Field>
          <Field label="Headline / Title">
            <input name="title" value={form.title} onChange={onChange} />
          </Field>
        </Row>

        <Row>
          <Field label="Industry">
            <input name="industry" value={form.industry} onChange={onChange} />
          </Field>
          <Field label="Experience Level">
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={onChange}
            >
              <option value="">(select)</option>
              <option>Intern</option>
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </Field>
        </Row>

        <Field label="Bio">
          <textarea name="biography" rows={4} value={form.biography} onChange={onChange} />
        </Field>

        <button disabled={saving} style={{ width: 140, height: 36 }}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>

      <DeleteAccount />
    </div>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div>{children}</div>
      <style>{`
        input, select, textarea {
          padding: 8px 10px;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          font: inherit;
        }
        textarea { resize: vertical; }
      `}</style>
    </label>
  );
}
