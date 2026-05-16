import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, Tag, ShieldAlert, Edit, Trash2, Plus, X } from 'lucide-react';
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
  
  // Product Form State
  const defaultProductState = { name: '', category: '', price: 399, image: '', images: [], stock: 10, description: '', variants: { options: [] } };
  const [productForm, setProductForm] = useState(defaultProductState);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    setUploadingImage(true);
    
    try {
      const newUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${apiUrl}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          newUrls.push(data.url);
        }
      }
      
      setProductForm(prev => {
        const updatedImages = [...prev.images, ...newUrls];
        return {
          ...prev,
          image: prev.image || newUrls[0], // Set first image as main if main is empty
          images: updatedImages
        };
      });
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (idxToRemove) => {
    setProductForm(prev => {
      const newImages = prev.images.filter((_, idx) => idx !== idxToRemove);
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : ''
      };
    });
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        images: product.images || [product.image],
        stock: product.stock,
        description: product.description || '',
        variants: product.variants || { options: [] }
      });
    } else {
      setEditingProduct(null);
      setProductForm(defaultProductState);
    }
    setShowProductModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.image) {
      alert("Please upload at least one image.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `${apiUrl}/api/admin/products/${editingProduct.id}` : `${apiUrl}/api/admin/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowProductModal(false);
        fetchData();
        alert(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (e) {
      alert("Failed to delete product");
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

  // Add Variant Option (e.g., Size, Material)
  const addVariantOption = () => {
    setProductForm(prev => {
      const newVariants = { ...prev.variants };
      if (!newVariants.options) newVariants.options = [];
      newVariants.options.push({ name: '', choices: [] });
      return { ...prev, variants: newVariants };
    });
  };

  // Add Choice to an Option
  const addVariantChoice = (optionIndex) => {
    setProductForm(prev => {
      const newVariants = { ...prev.variants };
      newVariants.options[optionIndex].choices.push({ label: '', priceModifier: 0 });
      return { ...prev, variants: newVariants };
    });
  };

  const updateVariantOption = (idx, field, val) => {
    setProductForm(prev => {
      const newVariants = { ...prev.variants };
      newVariants.options[idx][field] = val;
      return { ...prev, variants: newVariants };
    });
  };

  const updateVariantChoice = (optIdx, choiceIdx, field, val) => {
    setProductForm(prev => {
      const newVariants = { ...prev.variants };
      newVariants.options[optIdx].choices[choiceIdx][field] = val;
      return { ...prev, variants: newVariants };
    });
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <>
      <div className="page-transition animate-fade-in admin-dashboard" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '80vh', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="admin-header-flex">
          <ShieldAlert size={32} color="var(--primary-blue)" />
          <h1>Admin Dashboard</h1>
        </div>

        <div className="admin-tabs scrollable-tabs">
          <button className={`btn-primary ${activeTab !== 'orders' ? 'outline' : ''}`} onClick={() => setActiveTab('orders')}>
            <Package size={18} className="tab-icon" /> Orders
          </button>
          <button className={`btn-primary ${activeTab !== 'coupons' ? 'outline' : ''}`} onClick={() => setActiveTab('coupons')}>
            <Tag size={18} className="tab-icon" /> Coupons
          </button>
          <button className={`btn-primary ${activeTab !== 'products' ? 'outline' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} className="tab-icon" /> Products
          </button>
        </div>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="admin-content card-container">
            
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
                      <div key={order.id} className="order-box">
                        <div className="order-box-header">
                          <div className="order-box-title-group">
                            <span className="order-id-badge">#{order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}</span>
                            <span className="order-date-text">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className={`payment-type-badge ${isCOD ? 'cod' : 'prepaid'}`}>
                              {isCOD ? 'COD' : 'Prepaid'}
                            </span>
                          </div>
                          <div className="order-total-amount">₹{order.total_amount}</div>
                        </div>

                        <div className="order-box-body">
                          <div className="order-grid">
                            <div>
                              <h4 className="info-title">Customer</h4>
                              <p className="info-main">{order.customer_name}</p>
                              <p className="info-sub">{order.customer_email}</p>
                              {order.customer_phone && <p className="info-sub">{order.customer_phone}</p>}
                            </div>

                            <div>
                              <h4 className="info-title">Shipping Address</h4>
                              <p className="info-sub">{order.shipping_address || 'N/A'}</p>
                            </div>

                            <div>
                              <h4 className="info-title">Products</h4>
                              <div className="products-mini-list">
                                {items.map((item, idx) => (
                                  <div key={idx} className="product-mini-item">
                                    <span>{item.quantity}× {item.name} <span className="variant-label">({item.variantLabel || item.size || 'Base'})</span></span>
                                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="order-actions-bar">
                            <span className="status-label">Status:</span>
                            <div className="status-buttons">
                              {['pending', 'confirmed_cod', 'paid', 'shipped', 'delivered', 'cancelled'].map(status => {
                                const isActive = order.status === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => !isActive && updateOrderStatus(order.id, status)}
                                    className={`status-btn ${status} ${isActive ? 'active' : ''}`}
                                  >
                                    {status.replace('_', ' ').toUpperCase()}
                                  </button>
                                );
                              })}
                            </div>
                            <button className="delete-order-btn" onClick={() => deleteOrder(order.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && <p className="empty-message">No orders found.</p>}
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="two-col-layout">
                <div className="main-col">
                  <h2>Active Coupons</h2>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Discount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map(coupon => (
                          <tr key={coupon.id}>
                            <td className="highlight-cell">{coupon.code}</td>
                            <td>{coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                            <td>
                              <span className={`badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                                {coupon.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="action-cell">
                              <button onClick={() => toggleCoupon(coupon.id, coupon.is_active)} className={`action-btn ${coupon.is_active ? 'danger-text' : 'success-text'}`}>
                                {coupon.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => deleteCoupon(coupon.id)} className="action-btn text-muted">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="side-col">
                  <h3>Create New Coupon</h3>
                  <form onSubmit={createCoupon} className="admin-form">
                    <div className="form-group">
                      <label>Coupon Code</label>
                      <input required type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}>
                          <option value="percent">Percentage (%)</option>
                          <option value="fixed">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Value</label>
                        <input required type="number" min="1" value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary mt-2">Create Coupon</button>
                  </form>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div>
                <div className="flex-between mb-4">
                  <h2>Active Products ({products.length})</h2>
                  <button className="btn-primary" onClick={() => openProductModal()}><Plus size={18} /> Add Product</button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Base Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <img src={product.image.startsWith('http') ? product.image : encodeURI(product.image)} alt={product.name} className="product-thumb-table" onError={(e) => e.target.src='/Group 1.png'} />
                          </td>
                          <td className="fw-bold">{product.name}</td>
                          <td>{product.category}</td>
                          <td>₹{product.price}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={product.stock ?? 10}
                              onChange={(e) => updateStock(product.id, e.target.value)}
                              className={`stock-input ${product.stock === 0 ? 'out-of-stock' : ''}`}
                            />
                          </td>
                          <td className="action-cell">
                            <button onClick={() => openProductModal(product)} className="action-btn text-blue" title="Edit"><Edit size={18} /></button>
                            <button onClick={() => deleteProduct(product.id)} className="action-btn text-red" title="Delete"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan="6" className="text-center p-4">No products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay" onClick={(e) => { if(e.target===e.currentTarget) setShowProductModal(false); }}>
          <div className="modal-content product-modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={saveProduct} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input required type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Naruto Uzumaki" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input required type="text" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} placeholder="e.g. Anime Figures" />
                </div>
                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input required type="number" min="1" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input required type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Detailed product description..."></textarea>
              </div>

              <div className="form-group">
                <label>Images * (First image is main thumbnail)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage && <p className="text-blue mt-1">Uploading...</p>}
                
                <div className="image-preview-gallery mt-2">
                  {productForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="image-preview-item">
                      <img src={imgUrl} alt={`preview ${idx}`} />
                      <button type="button" className="remove-img-btn" onClick={() => removeImage(idx)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* VARIANTS SECTION */}
              <div className="variants-section mt-4">
                <div className="flex-between mb-2">
                  <h3 className="text-lg">Variants & Attributes</h3>
                  <button type="button" className="btn-outline btn-sm" onClick={addVariantOption}>+ Add Option Type</button>
                </div>
                <p className="text-muted text-sm mb-3">Add options like Size, Material, or Color to calculate final price.</p>
                
                {productForm.variants?.options?.map((option, optIdx) => (
                  <div key={optIdx} className="variant-option-box">
                    <div className="form-group">
                      <label>Option Name (e.g. Size)</label>
                      <input type="text" value={option.name} onChange={(e) => updateVariantOption(optIdx, 'name', e.target.value)} placeholder="Size" />
                    </div>
                    
                    <div className="choices-list">
                      <label>Choices</label>
                      {option.choices.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="choice-row">
                          <input type="text" value={choice.label} onChange={(e) => updateVariantChoice(optIdx, choiceIdx, 'label', e.target.value)} placeholder="e.g. 10cm" />
                          <input type="number" value={choice.priceModifier} onChange={(e) => updateVariantChoice(optIdx, choiceIdx, 'priceModifier', parseInt(e.target.value) || 0)} placeholder="+₹ Price Diff" title="Additional cost compared to base price" />
                        </div>
                      ))}
                      <button type="button" className="btn-link text-sm mt-1" onClick={() => addVariantChoice(optIdx)}>+ Add Choice</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer mt-4">
                <button type="button" className="btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploadingImage}>
                  {uploadingImage ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
