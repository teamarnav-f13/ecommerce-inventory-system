// Sidebar component
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  AlertTriangle, 
  User 
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/catalog', label: 'Product Catalog', icon: Package },
    { path: '/inventory', label: 'Inventory', icon: Warehouse },
    { path: '/alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;