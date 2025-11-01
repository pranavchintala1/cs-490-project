import React from 'react';

const CategoryCard = ({ data, maxHeight = '400px' }) => {
  // Default data if none provided
  const defaultData = [
    ["Sub1", ["thing1", "thing 2", "thing 3"]], 
    ["Sub2", ["thing4", "thing 5"]],
    ["Sub3", ["thing4", "thing 5"]],
    ["Sub4", ["thing4", "thing 5"]],
    ["Sub5", ["thing4", "thing 5"]],
    ["Sub6", ["thing4", "thing 5"]],
    ["Sub7", ["thing4", "thing 5"]], 
    ["Sub8", ["thing6", "thing7"]]
  ];

  const cardData = data || defaultData;

  // Check if data is empty array
  if (data && data.length === 0) {
    return (
      <div style={{
        width: '100%',
        padding: '10px', // Reduced padding to match
        backgroundColor: '#E5E9EC', // Soft Gray for card backgrounds
        borderRadius: '6px', // Smaller radius to match
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)', // Lighter shadow to match
        border: '1px solid #D1D5DB', // Divider Gray
        boxSizing: 'border-box', // Ensure padding doesn't cause overflow
        textAlign: 'center',

        height: maxHeight,
        overflowY: 'auto', // Move scrolling here
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #e5e9ec',
      }}>
        <p style={{ 
          margin: 0, 
          color: '#4A4A4A', // Text Secondary
          fontSize: '12px' // Smaller to match
        }}>
          No Data Available
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      padding: '10px', // Further reduced padding
      backgroundColor: '#E5E9EC', // Soft Gray for card backgrounds
      borderRadius: '6px', // Slightly smaller radius
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)', // Lighter shadow
      border: '1px solid #D1D5DB', // Divider Gray
      boxSizing: 'border-box', // Ensure padding doesn't cause overflow
      height: maxHeight,
      overflowY: 'auto', // Move scrolling here
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e1 #e5e9ec',
    }}>
      {cardData.map((section, index) => {
        const [subheading, items] = section;
        
        return (
          <div key={index} style={{ marginBottom: index === cardData.length - 1 ? '0' : '12px' }}>
            <h2 style={{
              fontSize: '14px', // Smaller heading
              fontWeight: '600',
              color: '#0A0F1A', // Text Primary
              marginBottom: '4px',
              paddingBottom: '2px',
              borderBottom: '1px solid #D1D5DB' // Divider Gray
            }}>
              {subheading}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((item, itemIndex) => (
                <li key={itemIndex} style={{
                  color: '#4A4A4A', // Text Secondary
                  marginLeft: '10px', // Further reduced margin
                  marginBottom: '2px', // Minimal spacing
                  fontSize: '12px', // Smaller text
                  lineHeight: '1.3'
                }}>
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryCard;