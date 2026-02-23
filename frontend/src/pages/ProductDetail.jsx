import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import { productAPI, getCurrentVendorId } from '../services/api';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setLoading(true);
      const response = await productAPI.listProductSKUs(productId);
      setSkus(response.skus || []);
    } catch (error) {
      console.error("Error loading SKUs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading SKUs...</p>
      </div>
    );
  }

  return (
    <div className="sku-page">
      <div className="page-header">
        <button className="btn-secondary" onClick={() => navigate('/catalog')}>
          <ArrowLeft size={18} />
          Back to Catalog
        </button>
        <h1>Manage SKUs</h1>
      </div>

      {skus.length === 0 ? (
        <div className="empty-state">
          <Layers size={48} />
          <h3>No SKUs created yet</h3>
          <p>Add variants for this product</p>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Variant</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr key={sku.sku}>
                  <td>{sku.sku}</td>
                  <td>{sku.variant_name}</td>
                  <td>${sku.unit_price?.toFixed(2)}</td>
                  <td>{sku.current_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
