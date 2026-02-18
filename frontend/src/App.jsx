import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { 
  Package, 
  LayoutGrid, 
  Layers, 
  AlertTriangle, 
  User, 
  LogOut 
} from 'lucide-react';

// Import pages
import Dashboard from './pages/Dashboard';
// import ProductCatalog from './pages/ProductCatalog';
// import Inventory from './pages/Inventory';
// import LowStockAlerts from './pages/LowStockAlerts';
// import VendorProfile from './pages/VendorProfile';

// Import styles
import './DashboardStyles.css';

function App() {
  return (
    <Authenticator
      components={{
        Header() {
          return (
            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
                ShopSmart Inventory
              </h2>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Vendor Inventory Management System
              </p>
            </div>
          );
        },
        Footer() {
          return (
            <div style={{ textAlign: 'center', padding: '16px', fontSize: '14px', color: '#6b7280' }}>
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          );
        }
      }}
    >
      {({ signOut, user }) => (
        <Router>
          <div className="app-container">
            {/* Header */}
            <header className="app-header">
              <div className="header-content">
                <NavLink to="/dashboard" className="logo">
                  <Package size={32} />
                  <span>ShopSmart Inventory Management System</span>
                </NavLink>
                
                <div className="header-user">
                  <div className="user-info">
                    <User size={18} />
                    <span>{user?.signInDetails?.loginId || user?.username}</span>
                  </div>
                  <button onClick={signOut} className="btn-sign-out">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Navigation */}
            <nav className="app-nav">
              <div className="nav-content">
                <NavLink to="/dashboard" className="nav-link">
                  <LayoutGrid size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/catalog" className="nav-link">
                  <Package size={18} />
                  <span>Product Catalog</span>
                </NavLink>
                <NavLink to="/inventory" className="nav-link">
                  <Layers size={18} />
                  <span>Inventory</span>
                </NavLink>
                <NavLink to="/alerts" className="nav-link">
                  <AlertTriangle size={18} />
                  <span>Low Stock Alerts</span>
                </NavLink>
                <NavLink to="/profile" className="nav-link">
                  <User size={18} />
                  <span>Profile</span>
                </NavLink>
              </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route 
                  path="/catalog" 
                  element={
                    <div className="loading-container">
                      <h2>Product Catalog</h2>
                      <p>Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <div className="loading-container">
                      <h2>Inventory Management</h2>
                      <p>Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <div className="loading-container">
                      <h2>Low Stock Alerts</h2>
                      <p>Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <div className="loading-container">
                      <h2>Vendor Profile</h2>
                      <p>Coming soon...</p>
                    </div>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;