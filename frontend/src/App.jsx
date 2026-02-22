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

import Dashboard from './pages/Dashboard';
import ProductCatalog from './pages/ProductCatalog';
import CreateProduct from './pages/CreateProduct';

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
        }
      }}
    >
      {({ signOut, user }) => (
        <Router>
          <div className="app-container">
            <header className="app-header">
              <div className="header-content">
                <NavLink to="/dashboard" className="logo">
                  <Package size={32} />
                  <span>ShopSmart Inventory</span>
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

            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/catalog" element={<ProductCatalog />} />
                <Route path="/catalog/new" element={<CreateProduct />} />
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
