// Product detail
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Product Detail</h1>
        <p>View and edit product information</p>
      </div>
      
      <div style={{ 
        padding: '2rem', 
        background: '#f1f5f9', 
        borderRadius: '8px',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#64748b' }}>
          📦 Product detail page coming soon...
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Product ID: {productId}
        </p>
      </div>
    </div>
  );
}

export default ProductDetail;