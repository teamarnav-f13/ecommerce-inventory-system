// Low stock alerts
function LowStockAlerts({ vendorId }) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Low Stock Alerts</h1>
          <p>All items below reorder threshold</p>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          background: '#f1f5f9', 
          borderRadius: '8px',
          textAlign: 'center' 
        }}>
          <p style={{ color: '#64748b' }}>
            ⚠️ Low stock alerts page coming soon...
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Vendor ID: {vendorId}
          </p>
        </div>
      </div>
    );
  }
  
  export default LowStockAlerts;