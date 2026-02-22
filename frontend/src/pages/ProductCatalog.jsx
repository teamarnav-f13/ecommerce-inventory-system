import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { productAPI, getCurrentVendorId } from '../services/api';

function ProductCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', is_active: true });

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const vendorId = await getCurrentVendorId();
      
      const params = {
        vendor_id: vendorId,
        ...filter
      };

      const response = await productAPI.listVendorProducts(params);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    
    try {
      const vendorId = await getCurrentVendorId();
      await productAPI.deleteProduct(productId, vendorId);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
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

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
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
                <td>${product.base_price.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon"
                      onClick={() => navigate(`/catalog/${product.product_id}`)}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => navigate(`/catalog/${product.product_id}/edit`)}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(product.product_id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Start by adding your first product</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/catalog/new')}
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCatalog;
