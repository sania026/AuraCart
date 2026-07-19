import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Clipboard, Plus, Trash2, Edit, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/currency';

export default function UserDashboard() {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tabs: 'orders', 'profile', 'addresses', 'viewed'
  const [activeTab, setActiveTab] = useState('orders');

  // Profile Update Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Address edit state
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Load addresses / orders / viewed when tab is active
  useEffect(() => {
    if (activeTab === 'addresses' && user) {
      fetchAddresses();
    } else if (activeTab === 'orders' && user) {
      fetchOrders();
    } else if (activeTab === 'viewed') {
      fetchRecentlyViewed();
    }
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchRecentlyViewed = async () => {
    const storedIds = localStorage.getItem('recentlyViewed');
    if (storedIds) {
      try {
        const { data } = await api.get(`/search/recently-viewed?ids=${storedIds}`);
        setRecentlyViewed(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const updateData = { name, email, phone };
      if (password) {
        updateData.password = password;
      }
      await updateProfile(updateData);
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPic(true);
    setProfileError('');
    setProfileSuccess('');

    const formData = new FormData();
    formData.append('images', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const pictureUrl = data.urls[0];
      await updateProfile({ profilePicture: pictureUrl });
      setProfileSuccess('Profile picture updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setNewAddr({
      fullName: addr.fullName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'India',
      isDefault: addr.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress._id}`, newAddr);
        alert('Address updated successfully!');
      } else {
        await api.post('/addresses', newAddr);
        alert('Address saved successfully!');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setNewAddr({
        fullName: '',
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        await api.delete(`/addresses/${addressId}`);
        fetchAddresses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete address.');
      }
    }
  };

  const handleSetDefaultAddress = async (addr) => {
    try {
      await api.put(`/addresses/${addr._id}`, { ...addr, isDefault: true });
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default address.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible.');
    if (!confirm1) return;

    const confirm2 = window.confirm('To confirm, you are requesting to delete all order records, address logs, and profiles. Click OK to delete.');
    if (!confirm2) return;

    try {
      await api.delete('/auth/profile');
      alert('Your account has been deleted successfully.');
      logout();
      navigate('/login');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="container fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 800 }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem' }} className="dashboard-layout">
        
        {/* Sidebar tabs */}
        <aside className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '1.25rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'start', padding: '0.625rem 1rem' }}
          >
            <Clipboard size={16} /> My Orders
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'start', padding: '0.625rem 1rem' }}
          >
            <User size={16} /> Profile Details
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`btn ${activeTab === 'addresses' ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'start', padding: '0.625rem 1rem' }}
          >
            <MapPin size={16} /> Shipping Addresses
          </button>

          <button
            onClick={() => setActiveTab('viewed')}
            className={`btn ${activeTab === 'viewed' ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'start', padding: '0.625rem 1rem' }}
          >
            <Eye size={16} /> Recently Viewed
          </button>
        </aside>

        {/* Dynamic Content Panel */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)' }}>
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Order History</h2>
              
              {loadingOrders ? (
                <div className="spinner"></div>
              ) : orders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '1rem' }}>Order ID</th>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Total</th>
                        <th style={{ padding: '1rem' }}>Paid</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row">
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{ord._id}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{formatPrice(ord.totalPrice)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${ord.isPaid ? 'badge-success' : 'badge-danger'}`}>
                              {ord.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${
                              ord.orderStatus === 'Delivered' ? 'badge-success' :
                              ord.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Link to={`/orders/${ord._id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No orders placed yet.</p>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Edit Profile</h2>

              {profileSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {profileError}
                </div>
              )}

              {/* Profile Avatar upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', background: '#1e1b4b' }}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <User size={36} />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    style={{ display: 'none' }}
                    id="profile-pic-input"
                    disabled={uploadingPic}
                  />
                  <label htmlFor="profile-pic-input" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: uploadingPic ? 'not-allowed' : 'pointer' }}>
                    {uploadingPic ? 'Uploading...' : 'Change Picture'}
                  </label>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99999 99999"
                  />
                </div>
                <div>
                  <label className="input-label">New Password (leave empty to keep current)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'start', marginTop: '0.5rem' }}>
                  Save Changes
                </button>
              </form>

              {/* Account deletion Area */}
              <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--error)', marginBottom: '0.5rem', fontWeight: 700 }}>Danger Zone</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Once you delete your account, all your personal information, order histories, wishlists, and addresses will be permanently removed. This action is irreversible.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Shipping Addresses</h2>
                {!showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="btn btn-outline" style={{ padding: '0.375rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Plus size={16} /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: '#fff' }}>{editingAddress ? 'Update Shipping Address' : 'Add New Address'}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="input-label">Full Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Phone Number</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Street Address</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newAddr.streetAddress}
                      onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="input-label">City</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">State</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Postal Code</label>
                      <input
                        type="text"
                        className="input-field"
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer', marginTop: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={newAddr.isDefault}
                        onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>Set as default shipping address</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary">{editingAddress ? 'Update Address' : 'Save Address'}</button>
                    <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); setNewAddr({ fullName: '', phone: '', streetAddress: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false }); }} className="btn btn-outline">Cancel</button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="spinner"></div>
              ) : addresses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {addresses.map((addr) => (
                    <div key={addr._id} className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'relative' }}>
                      <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {addr.fullName}
                        {addr.isDefault && <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Default</span>}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{addr.streetAddress}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Phone: {addr.phone}</p>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleEditAddressClick(addr)}
                        style={{ position: 'absolute', top: '15px', right: '42px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        title="Edit address"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No shipping addresses added yet.</p>
              )}
            </div>
          )}

          {/* RECENTLY VIEWED TAB */}
          {activeTab === 'viewed' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Recently Viewed Products</h2>
              {recentlyViewed.length > 0 ? (
                <div className="grid-cols-3">
                  {recentlyViewed.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No recently viewed items yet.</p>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .table-row:hover {
          background-color: rgba(255,255,255,0.01);
        }
        @media (max-width: 768px) {
          .dashboard-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
