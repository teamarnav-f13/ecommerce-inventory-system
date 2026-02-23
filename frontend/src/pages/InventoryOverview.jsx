import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';
import { inventoryAPI, getCurrentVendorId } from '../services/api';

function InventoryOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const vendorId = await getCurrentVendorId();
      
      const response = await inventoryAPI.getVendorInventory({
        vendor_id: vendorId,
        limit: 100
      });

      let items = response.inventory || [];

      // Apply filters
      if (filter === 'low-stock') {
        items = items.filter(item => item.current_stock <= item.reorder_threshold);
      } else if (filter === 'out-of-stock') {
        items = items.filter(item => item.current_stock === 0);
      }

      setInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item) => {
    if (item.current_stock === 0) return { label: 'Out of Stock', color: 'danger' };
    if (item.current_stock <= item.reorder_threshold) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const getStockIcon = (status) => {
    if (status.color === 'danger') return <XCircle size={18} />;
    if (status.color === 'warning') return <AlertTriangle size={18} />;
    return <CheckCircle size={18} />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Overview</h1>
          <p className="page-subtitle">View and manage all your stock levels</p>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`btn-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
          <button 
            className={`btn-filter ${filter === 'low-stock' ? 'active' : ''}`}
            onClick={() => setFilter('low-stock')}
          >
            <AlertTriangle size={16} />
            Low Stock
          </button>
          <button 
            className={`btn-filter ${filter === 'out-of-stock' ? 'active' : ''}`}
            onClick={() => setFilter('out-of-stock')}
          >
            <XCircle size={16} />
            Out of Stock
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">
          <Layers size={64} />
          <h3>No inventory items found</h3>
          <p>Create products and add SKU variants to see inventory here</p>
          <button className="btn-primary" onClick={() => navigate('/catalog/new')}>
            Add Product
          </button>
        </div>
      ) : (
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>SKU / Variant</th>
                <th>Current Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Unit Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={`${item.product_id}-${item.sku}`}>
                    <td>
                      <code>{item.product_id}</code>
                    </td>
                    <td>
                      <div>
                        <div className="font-weight-600">{item.variant_name}</div>
                        <code className="text-sm">{item.sku}</code>
                      </div>
                    </td>
                    <td className="font-weight-600">{item.current_stock}</td>
                    <td>{item.reserved_stock || 0}</td>
                    <td>{item.available_stock}</td>
                    <td>{item.reorder_threshold}</td>
                    <td>${item.unit_price?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge ${status.color}`}>
                        {getStockIcon(status)}
                        <span>{status.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryOverview;
