import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Eye, Layers } from 'lucide-react';
import { productAPI, getCurrentVendorId } from '../services/api';

function ProductCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Loading products...');
      const vendorId = await getCurrentVendorId();
      console.log('👤 Vendor ID:', vendorId);

      const response = await productAPI.listVendorProducts({
        vendor_id: vendorId,
        is_active: true
      });
      
      console.log('✅ Products loaded:', response);
      setProducts(response.products || []);
      
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    
    try {
      const vendorId = await getCurrentVendorId();
      await productAPI.deleteProduct(productId, vendorId);
      alert('Product deactivated successfully');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage your product listings</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/catalog/new')}
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>Error: {error}</span>
          <button onClick={loadProducts} className="btn-secondary">Retry</button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No products yet</h3>
          <p>Start by adding your first product to the catalog</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/catalog/new')}
          >
            <Plus size={20} />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.product_id}>
                  <td>
                    <div className="product-cell">
                      <Package size={18} />
                      <span>{product.product_name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand || '-'}</td>
                  <td>${product.base_price?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => navigate(`/catalog/${product.product_id}/skus`)}
                        title="Manage SKUs"
                      >
                        <Layers size={18} />
                      </button>
                      <button 
                        className="btn-icon danger"
                        onClick={() => handleDelete(product.product_id)}
                        title="Deactivate"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
