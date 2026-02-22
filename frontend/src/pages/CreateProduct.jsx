import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productAPI, getCurrentVendorId } from '../services/api';
import ImageUploader from '../components/ImageUploader';

function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    base_price: '',
    tags: ''
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Automotive',
    'Health & Beauty'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_name || !formData.category || !formData.base_price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const vendorId = await getCurrentVendorId();

      const productData = {
        vendor_id: vendorId,
        product_name: formData.product_name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        base_price: parseFloat(formData.base_price),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      console.log('Creating product:', productData);
      const response = await productAPI.createProduct(productData);
      console.log('Product created:', response);

      setProductId(response.product_id);
      alert('Product created successfully! You can now add images.');

    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUpdated = (newImages) => {
    setImages(newImages);
    alert('Images uploaded successfully!');
  };

  const handleFinish = () => {
    navigate('/catalog');
  };

  return (
    <div className="create-product-page">
      <div className="page-header">
        <button className="btn-secondary" onClick={() => navigate('/catalog')}>
          <ArrowLeft size={20} />
          <span>Back to Catalog</span>
        </button>
        <h1 className="page-title">Add New Product</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Product Information</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Headphones Pro"
                  disabled={productId !== null}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Category <span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={productId !== null}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Audio"
                  disabled={productId !== null}
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. SoundMax"
                  disabled={productId !== null}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed product description..."
                  rows={4}
                  disabled={productId !== null}
                />
              </div>

              <div className="form-group">
                <label>
                  Base Price <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={productId !== null}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="electronics, audio, wireless"
                  disabled={productId !== null}
                />
              </div>
            </div>

            {!productId && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/catalog')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={20} />
                  <span>{loading ? 'Creating...' : 'Create Product'}</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {productId && (
          <>
            <div className="success-message">
              ✅ Product created successfully! Product ID: <strong>{productId}</strong>
            </div>

            <ImageUploader
              productId={productId}
              existingImages={images}
              onImagesUpdated={handleImagesUpdated}
            />

            <div className="form-actions">
              <button
                className="btn-primary full-width"
                onClick={handleFinish}
              >
                Finish & Go to Catalog
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateProduct;
