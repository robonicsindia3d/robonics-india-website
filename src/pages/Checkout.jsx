import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { currentUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    sameAsBilling: true,
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('online');

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState('');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAddressLabel, setSaveAddressLabel] = useState('Home');

  const subtotal = getCartTotal();
  const [shippingCost, setShippingCost] = useState(99);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (token) {
      fetch(`${apiUrl}/api/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            // Auto-select the default address
            const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0];
            if (defaultAddr) {
              selectAddress(defaultAddr);
            }
          }
        })
        .catch(err => console.error('Failed to fetch addresses', err));
    }
  }, [token]);

  const selectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    const names = addr.full_name ? addr.full_name.split(' ') : ['', ''];
    setFormData(prev => ({
      ...prev,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      phone: addr.phone || prev.phone,
      billingAddress1: addr.address_line1 || '',
      billingAddress2: addr.address_line2 || '',
      billingCity: addr.city || '',
      billingState: addr.state || '',
      billingPincode: addr.pincode || '',
    }));
  };

  // Save address to backend after successful order
  const saveAddressAfterOrder = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (!token || !saveAddress) return; // Only save if user opted in
    if (!formData.billingAddress1 || !formData.billingCity || !formData.billingState || !formData.billingPincode) return;
    try {
      await fetch(`${apiUrl}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          label: saveAddressLabel,
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          address_line1: formData.billingAddress1,
          address_line2: formData.billingAddress2,
          city: formData.billingCity,
          state: formData.billingState,
          pincode: formData.billingPincode,
          is_default: savedAddresses.length === 0,
        })
      });
    } catch (err) {
      console.error('Failed to save address', err);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const { discount_type, discount_value } = data.coupon;
        let amount = 0;
        if (discount_type === 'percent') {
          amount = subtotal * (discount_value / 100);
        } else {
          amount = discount_value;
        }
        setDiscount(Math.min(amount, subtotal));
        setCouponStatus('Applied successfully!');
      } else {
        setDiscount(0);
        setCouponStatus(data.message || 'Invalid coupon');
      }
    } catch (err) {
      setDiscount(0);
      setCouponStatus('Error applying coupon');
    }
  };

  const total = subtotal + shippingCost - discount;

  // Dynamic Shipping Calculation
  useEffect(() => {
    const pincode = formData.sameAsBilling ? formData.billingPincode : formData.shippingPincode;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
      const calculateShipping = async () => {
        setIsCalculatingShipping(true);
        try {
          const res = await fetch(`${apiUrl}/api/calculate-shipping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              pincode, 
              items: cartItems,
              paymentMethod
            })
          });
          const data = await res.json();
          if (data.success) {
            setShippingCost(data.shippingCost);
          } else {
            // If unserviceable, maybe keep default or set a high fallback
            setShippingCost(150);
          }
        } catch (err) {
          console.error("Shipping calc failed", err);
        } finally {
          setIsCalculatingShipping(false);
        }
      };
      
      const timer = setTimeout(calculateShipping, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [formData.billingPincode, formData.shippingPincode, formData.sameAsBilling, cartItems, paymentMethod]);
  
  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Prefill form if user is logged in (only name/email, address comes from saved addresses now)
  useEffect(() => {
    if (currentUser) {
      const names = currentUser.name ? currentUser.name.split(' ') : ['', ''];
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || names[0] || '',
        lastName: prev.lastName || names.slice(1).join(' ') || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    // If user manually types, deselect saved address
    if (['billingAddress1', 'billingCity', 'billingState', 'billingPincode'].includes(e.target.name)) {
      setSelectedAddressId(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const apiUrl = import.meta.env.VITE_API_URL || '';

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    const bAddr = `${formData.billingAddress1}, ${formData.billingAddress2 ? formData.billingAddress2 + ', ' : ''}${formData.billingCity}, ${formData.billingState} - ${formData.billingPincode}`;
    const sAddr = formData.sameAsBilling 
      ? bAddr 
      : `${formData.shippingAddress1}, ${formData.shippingAddress2 ? formData.shippingAddress2 + ', ' : ''}${formData.shippingCity}, ${formData.shippingState} - ${formData.shippingPincode}`;

    if (paymentMethod === 'cod') {
      try {
        const res = await fetch(`${apiUrl}/api/place-cod-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            amount: total,
            customerName: fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: sAddr,
            billingAddress: bAddr,
            items: cartItems
          })
        });
        
        const data = await res.json();
        if (data.success) {
          await saveAddressAfterOrder();
          setIsProcessing(false);
          setIsSubmitted(true);
          clearCart();
        } else {
          throw new Error('Failed to place COD order');
        }
      } catch (err) {
        console.error(err);
        alert("Failed to place order. Please try again.");
        setIsProcessing(false);
      }
      return;
    }

    // Online Payment Flow
    try {
      // 1. Ask our backend to securely create a Razorpay Order
      const orderRes = await fetch(`${apiUrl}/api/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          amount: total,
          customerName: fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: sAddr,
          billingAddress: bAddr,
          items: cartItems
        })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error('Failed to create order on server');
      }

      // 2. Open Razorpay Checkout securely using the generated order_id
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Public Key from .env
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'RobonicsIndia 3D',
        description: 'Premium Anime 3D Prints',
        image: 'https://cdn-icons-png.flaticon.com/512/3612/3612592.png',
        order_id: orderData.order.id, // The secure Order ID from backend!
        handler: async function (response) {
          // 3. Verify Payment Signature on Backend
          try {
            const verifyRes = await fetch(`${apiUrl}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              await saveAddressAfterOrder();
              setIsProcessing(false);
              setIsSubmitted(true);
              clearCart();
            } else {
              alert('Payment Verification Failed!');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#1e40af',
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initialize payment gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !isSubmitted) {
    navigate('/cart');
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="page-transition animate-fade-in" style={{ paddingTop: '10rem', paddingBottom: '8rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container checkout-success" style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto', padding: '4rem 3rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <CheckCircle size={72} className="success-icon" style={{ color: '#10b981', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {paymentMethod === 'cod'
              ? 'Thank you for your order. Please keep the exact amount ready at the time of delivery.'
              : 'Thank you for your purchase. Your payment was verified securely via Razorpay.'}
          </p>
          <button className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }} onClick={() => navigate('/shop')}>Return to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition animate-fade-in checkout-page" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container checkout-container">
        <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

        <form className="checkout-layout" onSubmit={handlePayment}>
          <div className="checkout-main-col">
            <div className="form-group-section">
              <h2>Contact Information</h2>
              <div className="checkout-input-group">
                <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                <div className="checkout-input-row">
                  <input required type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                  <input required type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                </div>
                <input required type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group-section">
              <h2>Billing Address</h2>

              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} /> Use a saved address
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {savedAddresses.map(addr => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => selectAddress(addr)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${selectedAddressId === addr.id ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                          background: selectedAddressId === addr.id ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          maxWidth: '260px',
                          flex: '1 1 200px',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, background: addr.label === 'Home' ? '#dbeafe' : addr.label === 'Office' ? '#fef3c7' : '#f3e8ff', color: addr.label === 'Home' ? '#1d4ed8' : addr.label === 'Office' ? '#b45309' : '#7c3aed' }}>
                            {addr.label}
                          </span>
                          {addr.full_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {addr.address_line1}, {addr.city} - {addr.pincode}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(null);
                        setFormData(prev => ({ ...prev, billingAddress1: '', billingAddress2: '', billingCity: '', billingState: '', billingPincode: '' }));
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px dashed ${!selectedAddressId ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                        background: !selectedAddressId ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                        flex: '1 1 120px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      + New Address
                    </button>
                  </div>
                </div>
              )}

              <div className="checkout-input-group">
                <input required type="text" name="billingAddress1" placeholder="Address Line 1 (House No, Building, Street)" value={formData.billingAddress1} onChange={handleChange} />
                <input type="text" name="billingAddress2" placeholder="Address Line 2 (Area, Landmark) - Optional" value={formData.billingAddress2} onChange={handleChange} />

                <div className="checkout-input-row">
                  <input required type="text" name="billingCity" placeholder="City" value={formData.billingCity} onChange={handleChange} />
                  <input required type="text" name="billingState" placeholder="State" value={formData.billingState} onChange={handleChange} />
                </div>

                <input required type="text" name="billingPincode" placeholder="PIN Code" value={formData.billingPincode} onChange={handleChange} />

                {token && !selectedAddressId && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} style={{ width: 'auto' }} />
                      Save this address for future orders
                    </label>
                    {saveAddress && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {['Home', 'Office', 'Other'].map(tag => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setSaveAddressLabel(tag)}
                            style={{
                              padding: '0.4rem 0.85rem',
                              borderRadius: '9999px',
                              border: `1px solid ${saveAddressLabel === tag ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                              background: saveAddressLabel === tag ? 'var(--primary-blue)' : 'white',
                              color: saveAddressLabel === tag ? 'white' : 'var(--text-primary)',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                  <input type="checkbox" name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleChange} />
                  Shipping address is same as billing
                </label>
              </div>
            </div>

            {!formData.sameAsBilling && (
              <div className="form-group-section animate-fade-in">
                <h2>Shipping Address</h2>
                <div className="checkout-input-group">
                  <input required type="text" name="shippingAddress1" placeholder="Address Line 1 (House No, Building, Street)" value={formData.shippingAddress1} onChange={handleChange} />
                  <input type="text" name="shippingAddress2" placeholder="Address Line 2 (Area, Landmark) - Optional" value={formData.shippingAddress2} onChange={handleChange} />

                  <div className="checkout-input-row">
                    <input required type="text" name="shippingCity" placeholder="City" value={formData.shippingCity} onChange={handleChange} />
                    <input required type="text" name="shippingState" placeholder="State" value={formData.shippingState} onChange={handleChange} />
                  </div>

                  <input required type="text" name="shippingPincode" placeholder="PIN Code" value={formData.shippingPincode} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar-col">
            <div className="order-summary-box">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.cartItemId} style={{ marginBottom: '1rem' }}>
                    <div className="summary-item-row">
                      <span>{item.quantity}x {item.name} ({item.size})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                    {item.stock <= 0 && (
                      <p style={{ color: 'var(--primary-blue)', fontSize: '0.7rem', fontWeight: 600, marginTop: '-0.25rem' }}>
                        Shipping might take 4-5 days as product high in demand
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="coupon-section" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Have a coupon?</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} disabled={discount > 0} />
                  <button type="button" onClick={handleApplyCoupon} className="btn-primary" style={{ padding: '0.75rem 1rem', width: 'auto' }} disabled={discount > 0 || !couponCode.trim()}>Apply</button>
                </div>
                {couponStatus && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: discount > 0 ? '#10b981' : '#ef4444' }}>{couponStatus}</p>
                )}
              </div>

              <div className="summary-totals">
                <div className="summary-item-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-item-row">
                  <span>Shipping {isCalculatingShipping && <small>(calculating...)</small>}</span>
                  <span>₹{shippingCost}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-item-row" style={{ color: '#10b981' }}>
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="summary-item-row total-row">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              <div className="secure-badge">
                <ShieldCheck size={20} />
                <span>Secure UPI & Card Payments by Razorpay</span>
              </div>

              <div className="payment-method-selector" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: 'none', paddingBottom: '0' }}>Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `1px solid ${paymentMethod === 'online' ? 'var(--primary-blue)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'online' ? '#eff6ff' : 'white' }}>
                    <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ width: 'auto' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>Pay Online (UPI / Cards)</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instant secure payment via Razorpay</span>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `1px solid ${paymentMethod === 'cod' ? 'var(--primary-blue)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'cod' ? '#eff6ff' : 'white' }}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ width: 'auto' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>Cash on Delivery</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pay exactly ₹{total.toFixed(0)} when delivered</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary place-order-btn" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : (paymentMethod === 'cod' ? 'Place COD Order' : `Pay ₹${total} Securely`)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
