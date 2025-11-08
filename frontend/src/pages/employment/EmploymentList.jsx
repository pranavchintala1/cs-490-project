import { useState, useEffect } from "react";
import EmploymentForm from "./EmploymentForm";
import EmploymentAPI from "../../api/employment";
import { useLocation } from 'react-router-dom';


// Helper to parse date without timezone issues
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};




export default function EmploymentList() {
  


  const [items, setItems] = useState([]);
  const [editEntry, setEditEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  // 👇 Check for navigation state (if user came from a special link)
  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadEmployment();
  }, []);

  const loadEmployment = async () => {
    try {
      setLoading(true);
      const res = await EmploymentAPI.getAll();
      
      const transformedItems = (res.data || []).map(item => ({
        id: item._id,
        title: item.title,
        company: item.company,
        location: item.location,
        start_date: item.start_date,
        end_date: item.end_date,
        description: item.description
      }));
      
      setItems(transformedItems);
    } catch (error) {
      console.error("Failed to load employment:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (id, patch) => {
    try {
      await EmploymentAPI.update(id, patch);
      
      setItems(items.map(it => it.id === id ? { ...it, ...patch } : it));
    } catch (error) {
      console.error("Failed to update employment:", error);
      alert("Failed to update employment. Please try again.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this employment entry?")) return;
    
    try {
      await EmploymentAPI.delete(id);

      setItems(items.filter(it => it.id !== id));
    } catch (error) {
      console.error("Failed to delete employment:", error);
      alert("Failed to delete employment. Please try again.");
    }
  };

  const onAdded = async (data) => {
    try {
      if (data.id) {
        // Update existing
        await onUpdate(data.id, data);
      } else {
        // Add new
        const res = await EmploymentAPI.add(data);

        if (res && res.data.employment_id) {
          const newEntry = { ...data, id: res.data.employment_id };
          setItems([newEntry, ...items]);
        }
      }
      setShowForm(false);
      setEditEntry(null);
    } catch (error) {
      console.error("Failed to save employment:", error);
      alert("Failed to save employment. Please try again.");
    }
  };

  // Sort by start date descending (most recent first)
  const sortedItems = [...items].sort((a, b) => {
    if (!a.end_date && b.end_date) return -1; // Current positions first
    if (a.end_date && !b.end_date) return 1;
    const dateA = parseLocalDate(a.start_date);
    const dateB = parseLocalDate(b.start_date);
    return dateB - dateA;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "Present";
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (start, end) => {
    const startDate = parseLocalDate(start);
    const endDate = end ? parseLocalDate(end) : new Date();
    const months = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "#333" }}>💼 Employment History</h1>
        <p>Loading employment history...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{ margin: 0, color: "#333" }}>💼 Employment History</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditEntry(null);
          }}
          style={{
            padding: "12px 24px",
            background: "#4f8ef7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {showForm ? "← Cancel" : "+ Add Employment"}
        </button>
      </div>

      {showForm && (
        <EmploymentForm
          onAdded={onAdded}
          editEntry={editEntry}
          cancelEdit={() => {
            setEditEntry(null);
            setShowForm(false);
          }}
        />
      )}

      {/* Only show employment list if form is not shown */}
      {!showForm && (
        <>
          {sortedItems.length === 0 ? (
            <div style={{
              background: "#f9f9f9",
              padding: "40px",
              borderRadius: "8px",
              textAlign: "center",
              color: "#999"
            }}>
              <p style={{ fontSize: "16px" }}>No employment entries yet. Add your first one!</p>
            </div>
          ) : (
            <div style={{ position: "relative", marginTop: "40px" }}>
              {/* Timeline vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: "30px",
                  top: "8px",
                  bottom: 0,
                  width: "3px",
                  background: "linear-gradient(to bottom, #4f8ef7, #e0e0e0)",
                  zIndex: 0,
                }}
              />

              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {sortedItems.map((it) => {
                  const isCurrent = !it.end_date;
                  return (
                    <li key={it.id} style={{ marginBottom: "30px", position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start" }}>
                        {/* Timeline dot */}
                        <div style={{
                          width: "60px",
                          display: "flex",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              backgroundColor: isCurrent ? "#4f8ef7" : "#4caf50",
                              border: "3px solid white",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                              marginTop: "6px",
                            }}
                          />
                        </div>

                        {/* Date range */}
                        <div
                          style={{
                            width: "140px",
                            textAlign: "right",
                            marginRight: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            marginTop: "6px",
                            color: "#666",
                            flexShrink: 0
                          }}
                        >
                          <div>{formatDate(it.start_date)}</div>
                          <div style={{ margin: "4px 0", color: "#999" }}>—</div>
                          <div style={{ color: isCurrent ? "#4f8ef7" : "#666" }}>
                            {formatDate(it.end_date)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                            ({calculateDuration(it.start_date, it.end_date)})
                          </div>
                        </div>

                        {/* Content card */}
                        <div
                          style={{
                            border: "2px solid #ddd",
                            borderRadius: "8px",
                            padding: "16px",
                            background: isCurrent
                              ? "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)"
                              : "white",
                            flex: 1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderLeft: `4px solid ${isCurrent ? "#4f8ef7" : "#4caf50"}`
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "8px"
                          }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                margin: 0,
                                fontSize: "18px",
                                color: "#333",
                                marginBottom: "4px"
                              }}>
                                {it.title}
                              </h3>
                              {it.company && (
                                <p style={{
                                  margin: "4px 0",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  color: "#4f8ef7"
                                }}>
                                  {it.company}
                                </p>
                              )}
                              {it.location && (
                                <p style={{
                                  margin: "4px 0",
                                  fontSize: "14px",
                                  color: "#666"
                                }}>
                                  📍 {it.location}
                                </p>
                              )}
                            </div>

                            {isCurrent && (
                              <span style={{
                                background: "#4f8ef7",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                                marginLeft: "12px"
                              }}>
                                Current
                              </span>
                            )}
                          </div>

                          {it.description && (
                            <div style={{
                              marginTop: "12px",
                              padding: "12px",
                              background: "#f9f9f9",
                              borderRadius: "6px",
                              borderLeft: "3px solid #e0e0e0"
                            }}>
                              <p style={{
                                margin: 0,
                                color: "#555",
                                fontSize: "13px",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap"
                              }}>
                                {it.description}
                              </p>
                            </div>
                          )}

                          <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "16px",
                            paddingTop: "12px",
                            borderTop: "1px solid #eee"
                          }}>
                            <button
                              onClick={() => {
                                setEditEntry(it);
                                setShowForm(true);
                              }}
                              style={{
                                padding: "8px 16px",
                                background: "#34c759",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600"
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => onDelete(it.id)}
                              style={{
                                padding: "8px 16px",
                                background: "#ff3b30",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600"
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}