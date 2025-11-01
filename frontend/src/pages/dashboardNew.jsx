import React from 'react';
import CategoryCard from '../components/Card';
import ProgressTracker from '../components/ProgressTracker';
import { apiRequest } from "../api";

const fetchDataFromAPI = async (endpoint, headerKey) => {
  const apidata = await apiRequest(endpoint);

  function transformData(data, titleKey = "title") {
    return data.map(obj => {
      const cleaned = Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null)
      );
      if (Object.keys(cleaned).length === 0) return [];

      const title = cleaned[titleKey] ?? "(no title)";
      const otherValues = Object.entries(cleaned)
        .filter(([key]) => key !== titleKey)
        .map(([_, value]) => value);

      if (otherValues.length === 0 && !cleaned[titleKey]) return [];
      return [title, otherValues];
    }).filter(item => item.length > 0);
  }

  const formatted = transformData(apidata, headerKey);
  return formatted;
};


const Dashboard = () => {
  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: '#001E3C',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#FFFFFF',
            marginBottom: '40px',
          }}
        >
          Container Layout
        </h1>

        {/* Main grid layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '4fr 1fr', // left wide, right narrow
            gap: '20px',
            width: '100%',
          }}
        >
          {/* Left side: 3x2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // 2 columns
              gap: '20px',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                    height: '400px', // fixed height for scrollable area
                    // overflowY: 'auto',
                    // scrollbarWidth: 'thin',
                    // scrollbarColor: '#cbd5e1 #f9fafc',
                    // Remove all the visual styling (background, padding, borders)
                    // Let CategoryCard handle the visual appearance
                }}


                // style={{
                //   backgroundColor: '#F9FAFC',
                //   padding: '18px',
                //   borderRadius: '12px',
                //   border: '1px solid #D1D5DB',
                //   boxSizing: 'border-box',
                //   display: 'flex',
                //   alignItems: 'center',
                //   justifyContent: 'center',
                //   height: '400px', // fixed height for each box
                //   flexDirection: 'column',
                //   overflowY: 'auto', // ✅ scrolls internally if content overflows
                //   // ✨ Padding & inner gap for visual spacing
                //   padding: '16px',
                //   display: 'flex',
                //   flexDirection: 'column',
                //   scrollbarWidth: 'thin',
                //   scrollbarColor: '#cbd5e1 #f9fafc', // Firefox
                // }}
                className="scrollable-card"

              >
                <CategoryCard index={i} />
              </div>
            ))}
          </div>

          {/* Right side: 2 stacked sticky boxes */}
          <div
            style={{
              position: 'sticky',
              top: '20px', // stick 20px from top of viewport
              alignSelf: 'start',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: 'calc(100vh - 40px)', // full screen height minus padding
            }}
          >
            {/* Top Right Box */}
            <div
              style={{
                backgroundColor: '#F9FAFC',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                boxSizing: 'border-box',
                flex: 1, // half of sticky column height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="scrollable-card"
            >
              <div
                style={{
                  backgroundColor: '#E5E9EC',
                  padding: '10px',
                  borderRadius: '8px',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #D1D5DB',
                }}
              >
                <span
                  style={{
                    color: '#003366',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Right Container 1
                </span>
              </div>
            </div>

            {/* Bottom Right Box */}
            <div
              style={{
                backgroundColor: '#F9FAFC',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                boxSizing: 'border-box',
                flex: 1, // second half
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="scrollable-card"
            >
              <div
                style={{
                  backgroundColor: '#E5E9EC',
                  padding: '10px',
                  borderRadius: '8px',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #D1D5DB',
                }}
              >
                <span
                  style={{
                    color: '#003366',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Right Container 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
