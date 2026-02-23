import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { inventoryAPI, getCurrentVendorId } from '../services/api';

function LowStockAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const vendorId = await getCurrentVendorId();
      const response = await inventoryAPI.getLowStockItems(vendorId);
      setAlerts(response.items || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgency = (item) => {
    const percentage = (item.current_stock / item.reorder_threshold) * 100;
    if (percentage <= 50) return 'critical';
    if (percentage <= 75) return 'high';
    return 'medium';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Low Stock Alerts</h1>
          <p className="page-subtitle">Items that need restocking soon</p>
        </div>
        <button className="btn-secondary" onClick={loadAlerts}>
          Refresh
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={64} style={{ color: '#10b981' }} />
          <h3>All stock levels are healthy!</h3>
          <p>No items need restocking at this time</p>
        </div>
      ) : (
        <>
          <div className="alert-summary">
            <div className="summary-card">
              <AlertTriangle size={32} />
              <div>
                <div className="summary-value">{alerts.length}</div>
                <div className="summary-label">Items Need Attention</div>
              </div>
            </div>
          </div>

          <div className="alerts-list">
            {alerts.map((item) => {
              const urgency = getUrgency(item);
              return (
                <div key={`${item.product_id}-${item.sku}`} className={`alert-card ${urgency}`}>
                  <div className="alert-icon">
                    <AlertTriangle size={24} />
                  </div>
                  
                  <div className="alert-content">
                    <h3>{item.variant_name}</h3>
                    <p>
                      <code>{item.sku}</code> • Product ID: <code>{item.product_id}</code>
                    </p>
                    
                    <div className="alert-stats">
                      <div className="stat">
                        <span className="label">Current:</span>
                        <span className="value">{item.current_stock}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Threshold:</span>
                        <span className="value">{item.reorder_threshold}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Available:</span>
                        <span className="value">{item.available_stock}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert-badge">
                    <span className={`urgency-${urgency}`}>
                      {urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default LowStockAlerts;
