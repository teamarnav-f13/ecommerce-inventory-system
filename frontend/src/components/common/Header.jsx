// Header component
import { LogOut, User } from 'lucide-react';

function Header({ user, signOut }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo">📦 ShopSmart Inventory</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <User size={20} />
            <span>{user?.signInDetails?.loginId || user?.username || 'Vendor'}</span>
          </div>
          <button onClick={signOut} className="btn-sign-out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;