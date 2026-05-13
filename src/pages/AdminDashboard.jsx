import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, Tag, Check, X, ShieldAlert } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent', value: 10 });
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 399, image: '', stock: 10 });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const [ordersRes, couponsRes, productsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/admin/coupons`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/products`)
      ]);
      const ordersData = await ordersRes.json();
      const couponsData = await couponsRes.json();
      const productsData = await productsRes.json();
      
      if (ordersData.success) setOrders(ordersData.orders);
      if (couponsData.success) setCoupons(couponsData.coupons);
      if (productsData.success) setProducts(productsData.products);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: newCoupon.code, discount_type: newCoupon.type, discount_value: newCoupon.value })
      });
      const data = await res.json();
      if (data.success) {
        setNewCoupon({ code: '', type: 'percent', value: 10 });
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to create coupon");
    }
  };

  const toggleCoupon = async (id, currentStatus) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/admin/coupons/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchData();
    } catch (e) {
      alert("Failed to toggle coupon");
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      alert("Failed to delete coupon");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order PERMANENTLY?')) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      alert("Failed to delete order");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewProduct(prev => ({ ...prev, image: data.url }));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image) {
      alert("Please upload an image first.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        setNewProduct({ name: '', category: '', price: 399, image: '', stock: 10 });
        fetchData();
        alert('Product created successfully!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to create product");
    }
  };

  const updateStock = async (productId, newStock) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiUrl}/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: parseInt(newStock) } : p));
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="page-transition animate-fade-in admin-dashboard" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '80vh', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <ShieldAlert size={32} color="var(--primary-blue)" />
          <h1>Admin Dashboard</h1>
        </div>

        <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className={`btn-primary ${activeTab !== 'orders' ? 'outline' : ''}`} onClick={() => setActiveTab('orders')} style={{ padding: '0.75rem 1.5rem' }}>
            <Package size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Orders
          </button>
          <button className={`btn-primary ${activeTab !== 'coupons' ? 'outline' : ''}`} onClick={() => setActiveTab('coupons')} style={{ padding: '0.75rem 1.5rem' }}>
            <Tag size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Coupons
          </button>
          <button className={`btn-primary ${activeTab !== 'products' ? 'outline' : ''}`} onClick={() => setActiveTab('products')} style={{ padding: '0.75rem 1.5rem' }}>
            <Package size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Products
          </button>
        </div>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="admin-content" style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders ({orders.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {orders.map(order => {
                    const isCOD = order.id.startsWith('cod_');
                    let items = [];
                    try { items = JSON.parse(order.items); } catch(e) {}
                    
                    return (
                      <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: isCOD ? '#fef3c7' : '#dcfce7',
                              color: isCOD ? '#b45309' : '#166534',
                            }}>
                              {isCOD ? 'Cash on Delivery' : 'Prepaid'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{order.total_amount}</span>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            
                            {/* Customer & Address */}
                            <div>
                              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Customer</h4>
                              <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{order.customer_name}</p>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{order.customer_email}</p>
                              {order.customer_phone && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.customer_phone}</p>}
                            </div>

                            <div>
                              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Shipping Address</h4>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{order.shipping_address || 'N/A'}</p>
                            </div>

                            {/* Products */}
                            <div>
                              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Products</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span>{item.quantity}× {item.name} <span style={{ color: 'var(--text-secondary)' }}>({item.size})</span></span>
                                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Status Actions */}
                          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
                            {['pending', 'confirmed_cod', 'paid', 'shipped', 'delivered', 'cancelled'].map(status => {
                              const isActive = order.status === status;
                              const colors = {
                                pending: { bg: '#fef3c7', text: '#b45309' },
                                confirmed_cod: { bg: '#e0e7ff', text: '#4f46e5' },
                                paid: { bg: '#dcfce7', text: '#166534' },
                                shipped: { bg: '#f3e8ff', text: '#7c3aed' },
                                delivered: { bg: '#dcfce7', text: '#166534' },
                                cancelled: { bg: '#fee2e2', text: '#991b1b' },
                              };
                              const labels = {
                                pending: 'Pending',
                                confirmed_cod: 'Confirmed',
                                paid: 'Paid',
                                shipped: 'Shipped',
                                delivered: 'Delivered',
                                cancelled: 'Cancelled',
                              };
                              return (
                                <button
                                  key={status}
                                  onClick={() => !isActive && updateOrderStatus(order.id, status)}
                                  style={{
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: isActive ? 'none' : '1px solid var(--border-color)',
                                    background: isActive ? colors[status].bg : 'white',
                                    color: isActive ? colors[status].text : 'var(--text-secondary)',
                                    cursor: isActive ? 'default' : 'pointer',
                                    transition: 'all 0.15s',
                                    opacity: isActive ? 1 : 0.7,
                                  }}
                                >
                                  {labels[status]}
                                </button>
                              );
                            })}
                            <div style={{ marginLeft: 'auto' }}>
                              <button 
                                onClick={() => deleteOrder(order.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem' }}
                              >
                                Delete Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No orders found.</p>
                  )}
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                  <div style={{ flex: '1 1 500px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Coupons</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '1rem' }}>Code</th>
                          <th style={{ padding: '1rem' }}>Discount</th>
                          <th style={{ padding: '1rem' }}>Status</th>
                          <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map(coupon => (
                          <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{coupon.code}</td>
                            <td style={{ padding: '1rem' }}>
                              {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', background: coupon.is_active ? '#dcfce7' : '#fee2e2', color: coupon.is_active ? '#166534' : '#991b1b' }}>
                                {coupon.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                              <button 
                                onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: coupon.is_active ? '#ef4444' : '#10b981', fontWeight: 'bold' }}
                              >
                                {coupon.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => deleteCoupon(coupon.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.8rem' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No coupons found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ flex: '1 1 300px', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Create New Coupon</h3>
                    <form onSubmit={createCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Coupon Code</label>
                        <input required type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Type</label>
                          <select value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed">Flat Amount (₹)</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Value</label>
                          <input required type="number" min="1" value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Coupon</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                  <div style={{ flex: '1 1 500px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Products ({products.length})</h2>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '1rem' }}>Image</th>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem' }}>
                                <img src={product.image.startsWith('http') ? product.image : encodeURI(product.image)} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => e.target.src='/Group 1.png'} />
                              </td>
                              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.name}</td>
                              <td style={{ padding: '1rem' }}>{product.category}</td>
                              <td style={{ padding: '1rem' }}>₹{product.price}</td>
                              <td style={{ padding: '1rem' }}>
                                <input
                                  type="number"
                                  min="0"
                                  value={product.stock ?? 10}
                                  onChange={(e) => updateStock(product.id, e.target.value)}
                                  style={{
                                    width: '65px',
                                    padding: '0.4rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    color: (product.stock ?? 10) === 0 ? '#ef4444' : 'var(--text-primary)',
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                          {products.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No products found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ flex: '1 1 300px', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Add New Product</h3>
                    <form onSubmit={createProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Product Name</label>
                        <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Naruto Uzumaki" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category</label>
                        <input required type="text" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} placeholder="e.g. Anime" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Price (₹)</label>
                        <input required type="number" min="1" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Stock Quantity</label>
                        <input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Image</label>
                        <input required={!newProduct.image} type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                        {uploadingImage && <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary-blue)' }}>Uploading...</p>}
                        {newProduct.image && !uploadingImage && <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'green' }}>Image uploaded successfully!</p>}
                      </div>
                      <button type="submit" className="btn-primary" disabled={uploadingImage} style={{ marginTop: '0.5rem' }}>
                        {uploadingImage ? 'Uploading Image...' : 'Add Product'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
