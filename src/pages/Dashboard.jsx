import { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, LogOut, User, MapPin, Plus, Star } from 'lucide-react';
import './Auth.css';

const EMPTY_ADDRESS = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  is_default: false,
};

const Dashboard = () => {
  const { currentUser, token, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const [ordersRes, addressRes] = await Promise.all([
        fetch(`${apiUrl}/api/orders/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const ordersData = await ordersRes.json();
      const addressData = await addressRes.json();
      if (ordersData.success) setOrders(ordersData.orders);
      if (addressData.success) setAddresses(addressData.addresses);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- Address CRUD handlers ---
  const openAddForm = () => {
    setEditingAddress(null);
    setAddressForm({ ...EMPTY_ADDRESS, full_name: currentUser?.name || '' });
    setShowAddressForm(true);
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: !!addr.is_default,
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = editingAddress
      ? `${apiUrl}/api/addresses/${editingAddress.id}`
      : `${apiUrl}/api/addresses`;
    const method = editingAddress ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddressForm(false);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSetDefault = async (addr) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...addr, is_default: true })
      });
      fetchData();
    } catch (err) {
      alert('Failed to set default');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="page-transition animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '70vh' }}>
      <div className="container">
        <div className="dashboard-header">
          <div className="user-profile-header">
            <div className="user-avatar">
              <User size={32} />
            </div>
            <div>
              <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {currentUser.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
            </div>
          </div>
          <button className="btn-outline logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Quick Order Status for Ease of Use */}
        {!isLoading && orders.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Latest Order Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>#{orders[0].id.slice(0, 8)}...</span>
                <span className={`order-status status-${orders[0].status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                  {orders[0].status.toUpperCase()}
                </span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setActiveTab('orders')} style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              View All Orders
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button className={`dashboard-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Package size={18} /> Orders
          </button>
          <button className={`dashboard-tab ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            <MapPin size={18} /> Addresses
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="dashboard-content">
            {isLoading ? (
              <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <p>You haven't placed any orders yet.</p>
                <button className="btn-primary mt-4" onClick={() => navigate('/shop')}>Start Shopping</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">Order #{order.id}</span>
                        <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <p><strong>Total:</strong> ₹{order.total_amount}</p>
                      <p><strong>Shipping To:</strong> {order.shipping_address}</p>
                      <div className="order-items-preview">
                        {JSON.parse(order.items).map((item, idx) => (
                          <div key={idx} className="order-item-mini">
                            {item.quantity}x {item.name} ({item.size})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="dashboard-content">
            {isLoading ? (
              <p>Loading your addresses...</p>
            ) : (
              <div className="address-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className={`address-card ${addr.is_default ? 'is-default' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`address-label-tag ${addr.label.toLowerCase()}`}>{addr.label}</span>
                      {!!addr.is_default && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Star size={12} fill="currentColor" /> Default
                        </span>
                      )}
                    </div>
                    <div className="address-name">{addr.full_name}</div>
                    {addr.phone && <div className="address-phone">{addr.phone}</div>}
                    <div className="address-text">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                    <div className="address-card-actions">
                      <button className="edit-btn" onClick={() => openEditForm(addr)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                      {!addr.is_default && (
                        <button className="default-btn" onClick={() => handleSetDefault(addr)}>Set Default</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Address Card */}
                <div className="add-address-card" onClick={openAddForm}>
                  <Plus size={28} />
                  <span style={{ fontWeight: 600 }}>Add New Address</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="address-form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddressForm(false); }}>
          <div className="address-form-modal">
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSaveAddress}>
              <div className="form-field">
                <label>Tag</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Home', 'Office', 'Other'].map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setAddressForm(prev => ({ ...prev, label: tag }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        border: `1px solid ${addressForm.label === tag ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                        background: addressForm.label === tag ? 'var(--primary-blue)' : 'white',
                        color: addressForm.label === tag ? 'white' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Full Name</label>
                  <input required type="text" value={addressForm.full_name} onChange={e => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Full Name" />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input type="tel" value={addressForm.phone} onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone Number" />
                </div>
              </div>

              <div className="form-field">
                <label>Address Line 1</label>
                <input required type="text" value={addressForm.address_line1} onChange={e => setAddressForm(prev => ({ ...prev, address_line1: e.target.value }))} placeholder="House No, Building, Street" />
              </div>

              <div className="form-field">
                <label>Address Line 2 (Optional)</label>
                <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm(prev => ({ ...prev, address_line2: e.target.value }))} placeholder="Area, Landmark" />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>City</label>
                  <input required type="text" value={addressForm.city} onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))} placeholder="City" />
                </div>
                <div className="form-field">
                  <label>State</label>
                  <input required type="text" value={addressForm.state} onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))} placeholder="State" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>PIN Code</label>
                  <input required type="text" value={addressForm.pincode} onChange={e => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))} placeholder="PIN Code" />
                </div>
                <div className="form-field" style={{ justifyContent: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))} style={{ width: 'auto' }} />
                    Set as default
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingAddress ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
