// Stock history
import { useParams } from 'react-router-dom';

function StockHistory() {
  const { productId, sku } = useParams();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stock History</h1>
        <p>Transaction history for this SKU</p>
      </div>
      
      <div style={{ 
        padding: '2rem', 
        background: '#f1f5f9', 
        borderRadius: '8px',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#64748b' }}>
          📜 Stock history coming soon...
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Product: {productId} • SKU: {sku}
        </p>
      </div>
    </div>
  );
}

export default StockHistory;