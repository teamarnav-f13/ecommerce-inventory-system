function ProductCatalog({ vendorId }) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Product Catalog</h1>
          <p>Manage your products and variants</p>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          background: '#f1f5f9', 
          borderRadius: '8px',
          textAlign: 'center' 
        }}>
          <p style={{ color: '#64748b' }}>
            📦 Product catalog management coming soon...
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Vendor ID: {vendorId}
          </p>
        </div>
      </div>
    );
  }
  
  export default ProductCatalog;