import { useState, useEffect } from 'react';
import { User, Mail, Phone, Package } from 'lucide-react';
import { vendorAPI } from '../services/api';
import { fetchAuthSession } from 'aws-amplify/auth';

function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      
      setProfile({
        email: session.tokens?.idToken?.payload?.email || 'vendor1@example.com',
        vendor_id: session.tokens?.idToken?.payload?.sub || 'VENDOR-001',
        username: session.tokens?.idToken?.payload['cognito:username'] || 'vendor1'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Vendor Profile</h1>
      <p className="page-subtitle">Your account information</p>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div>
            <h2>{profile?.username || 'Vendor'}</h2>
            <p className="text-gray">{profile?.email}</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <div className="info-label">
              <Package size={18} />
              <span>Vendor ID</span>
            </div>
            <div className="info-value">
              <code>{profile?.vendor_id}</code>
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">
              <Mail size={18} />
              <span>Email</span>
            </div>
            <div className="info-value">{profile?.email}</div>
          </div>

          <div className="info-row">
            <div className="info-label">
              <User size={18} />
              <span>Username</span>
            </div>
            <div className="info-value">{profile?.username}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;
