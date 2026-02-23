import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Search,
  RefreshCw,
  Plus
} from 'lucide-react';
import { inventoryAPI, getCurrentVendorId } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSKUs: 0,
    lowStockItems: 0,
    outOfStock: 0,
    loading: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
  try {
    setStats(prev => ({ ...prev, loading: true }));
    setError(null);

    const vendorId = await getCurrentVendorId();
    const statsData = await inventoryAPI.getVendorStats(vendorId);

    setStats({
      ...statsData,
      loading: false
    });

  } catch (error) {
    console.error('Dashboard stats load failed:', error.message);
    
    setError('Failed to load dashboard data');
    setStats({
      totalProducts: 0,
      totalSKUs: 0,
      lowStockItems: 0,
      outOfStock: 0,
      loading: false
    });
  }
};

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${searchQuery}`);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, onClick }) => (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon" style={{ backgroundColor: bgColor }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{stats.loading ? '...' : value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Inventory Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your inventory status</p>
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
          <AlertTriangle size={20} />
          <span>Error loading data: {error}</span>
          <button onClick={loadDashboardStats} className="btn-secondary">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts}
          color="#2563eb"
          bgColor="#dbeafe"
          onClick={() => navigate('/catalog')}
        />
        <StatCard
          icon={Layers}
          title="Total SKUs"
          value={stats.totalSKUs}
          color="#059669"
          bgColor="#d1fae5"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock Items"
          value={stats.lowStockItems}
          color="#f59e0b"
          bgColor="#fef3c7"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          icon={XCircle}
          title="Out of Stock"
          value={stats.outOfStock}
          color="#dc2626"
          bgColor="#fee2e2"
          onClick={() => navigate('/inventory?filter=out-of-stock')}
        />
      </div>

      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        
        <div className="quick-actions-grid">
          <div 
            className="action-card"
            onClick={() => navigate('/catalog/new')}
          >
            <div className="action-icon" style={{ backgroundColor: '#dbeafe' }}>
              <Plus size={24} style={{ color: '#2563eb' }} />
            </div>
            <h3>Add New Product</h3>
            <p>Create a new product listing</p>
          </div>

          <div 
            className="action-card"
            onClick={() => navigate('/alerts')}
          >
            <div className="action-icon" style={{ backgroundColor: '#fef3c7' }}>
              <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
            </div>
            <h3>View Low Stock</h3>
            <p>Items needing restock</p>
          </div>

          <div 
            className="action-card"
            onClick={() => navigate('/inventory')}
          >
            <div className="action-icon" style={{ backgroundColor: '#d1fae5' }}>
              <TrendingUp size={24} style={{ color: '#059669' }} />
            </div>
            <h3>Full Inventory</h3>
            <p>View all stock levels</p>
          </div>

          <div 
            className="action-card"
            onClick={loadDashboardStats}
          >
            <div className="action-icon" style={{ backgroundColor: '#e0e7ff' }}>
              <RefreshCw size={24} style={{ color: '#6366f1' }} />
            </div>
            <h3>Refresh Data</h3>
            <p>Update dashboard stats</p>
          </div>
        </div>
      </div>

      <div className="quick-search-section">
        <h2 className="section-title">Quick Stock Checker</h2>
        <p className="section-subtitle">Search by Product ID or Name</p>
        
        <form onSubmit={handleQuickSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Enter Product ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
