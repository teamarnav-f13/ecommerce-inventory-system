import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react';
import { inventoryAPI, getCurrentVendorId } from '../services/api';

function InventoryOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustment, setAdjustment] = useState("");

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

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustment(0);
    setShowModal(true);
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;

    try {
      await inventoryAPI.adjustStock(
        selectedItem.product_id,
        selectedItem.sku,
        Number(adjustment)
      );

      alert("Stock updated successfully");
      setShowModal(false);
      loadInventory();
    } catch (error) {
      console.error("Stock update failed:", error);
      alert("Failed to update stock");
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
          <p className="page-subtitle">Manage your stock levels</p>
        </div>

        <div className="filter-buttons">
          <button className={`btn-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All Items
          </button>
          <button className={`btn-filter ${filter === 'low-stock' ? 'active' : ''}`} onClick={() => setFilter('low-stock')}>
            Low Stock
          </button>
          <button className={`btn-filter ${filter === 'out-of-stock' ? 'active' : ''}`} onClick={() => setFilter('out-of-stock')}>
            Out of Stock
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">
          <Layers size={64} />
          <h3>No inventory items found</h3>
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
                <th>Current</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={`${item.product_id}-${item.sku}`}>
                    <td><code>{item.product_id}</code></td>
                    <td>
                      <div>
                        <div>{item.variant_name}</div>
                        <code>{item.sku}</code>
                      </div>
                    </td>
                    <td>{item.current_stock}</td>
                    <td>{item.reserved_stock || 0}</td>
                    <td>{item.available_stock}</td>
                    <td>{item.reorder_threshold}</td>
                    <td>${item.unit_price?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${status.color}`}>
                        {getStockIcon(status)}
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => openAdjustModal(item)}>
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Adjust Stock</h3>
            <p><strong>{selectedItem.variant_name}</strong></p>
            <p>Current Stock: {selectedItem.current_stock}</p>

            <input
              type="number"
              placeholder="Enter + or - quantity"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdjustStock}>
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryOverview;
