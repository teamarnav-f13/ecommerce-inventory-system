import ProductCatalog from './pages/ProductCatalog';
import Dashboard from './pages/Dashboard';

// ... rest of imports ...

// Inside the Router, replace the Routes section:
<Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/catalog" element={<ProductCatalog />} />
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
