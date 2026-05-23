import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, ShieldCheck, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import './Checkout.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { currentUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
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

  const subtotal = getCartTotal();
  
  // --- Simplified Shipping Rules ---
  // Flat ₹99 for orders < 1500, else Free
  const isFreeShipping = subtotal >= 1500;
  const shippingCost = isFreeShipping ? 0 : 99;
  const total = Math.max(0, subtotal + shippingCost - discount);

  // Prefill user details
  useEffect(() => {
    if (currentUser) {
      const names = currentUser.name ? currentUser.name.split(' ') : ['', ''];
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || names[0] || '',
        lastName: prev.lastName || names.slice(1).join(' ') || '',
        email: prev.email || currentUser.email || '',
      }));
    }
  }, [currentUser]);

  // Fetch saved addresses and auto-select default
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
            
            // Auto-select default address if not already selected
            if (!selectedAddressId) {
              const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0];
              if (defaultAddr) {
                selectAddress(defaultAddr);
              }
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
        let amount = discount_type === 'percent' ? subtotal * (discount_value / 100) : discount_value;
        setDiscount(amount);
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

  const nextStep = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (saveAddress && token) {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        try {
          await fetch(`${apiUrl}/api/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              label: 'Other',
              full_name: `${formData.firstName} ${formData.lastName}`,
              phone: formData.phone,
              address_line1: formData.billingAddress1,
              address_line2: formData.billingAddress2,
              city: formData.billingCity,
              state: formData.billingState,
              pincode: formData.billingPincode,
              is_default: savedAddresses.length === 0
            })
          });
        } catch (e) { console.error("Failed to save address"); }
      }
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const bAddr = `${formData.billingAddress1}, ${formData.billingAddress2 ? formData.billingAddress2 + ', ' : ''}${formData.billingCity}, ${formData.billingState} - ${formData.billingPincode}`;
    const sAddr = formData.sameAsBilling ? bAddr : `${formData.shippingAddress1}, ${formData.shippingAddress2 ? formData.shippingAddress2 + ', ' : ''}${formData.shippingCity}, ${formData.shippingState} - ${formData.shippingPincode}`;

    if (paymentMethod === 'cod') {
      try {
        const res = await fetch(`${apiUrl}/api/place-cod-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
          body: JSON.stringify({ amount: total, customerName: fullName, customerEmail: formData.email, customerPhone: formData.phone, shippingAddress: sAddr, billingAddress: bAddr, items: cartItems })
        });
        const data = await res.json();
        if (data.success) {
          setIsSubmitted(true);
          clearCart();
        } else throw new Error('Order failed');
      } catch (err) {
        alert("Failed to place order.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      const orderRes = await fetch(`${apiUrl}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ amount: total, customerName: fullName, customerEmail: formData.email, customerPhone: formData.phone, shippingAddress: sAddr, billingAddress: bAddr, items: cartItems })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed on backend');

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'RoboPrint 3D',
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${apiUrl}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setIsSubmitted(true);
            clearCart();
          } else alert('Payment Verification Failed!');
          setIsProcessing(false);
        },
        prefill: { name: fullName, email: formData.email, contact: formData.phone },
        theme: { color: '#1e40af' }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Payment Error: " + (error.message || JSON.stringify(error)));
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (['billingAddress1', 'billingCity', 'billingState', 'billingPincode'].includes(e.target.name)) setSelectedAddressId(null);
  };

  if (cartItems.length === 0 && !isSubmitted) {
    navigate('/cart');
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="page-transition animate-fade-in" style={{ paddingTop: '10rem', paddingBottom: '8rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container checkout-success" style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto', padding: '4rem 3rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <CheckCircle size={72} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
          <h1>{paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Thank you for your order. We will process it shortly!</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition animate-fade-in checkout-page" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 1 ? 'var(--primary-blue)' : 'var(--text-secondary)', fontWeight: 700 }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 1 ? 'var(--primary-blue)' : 'var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            Address
          </div>
          <div style={{ width: '50px', height: '1px', background: 'var(--border-color)', alignSelf: 'center' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 2 ? 'var(--primary-blue)' : 'var(--text-secondary)', fontWeight: 700 }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 2 ? 'var(--primary-blue)' : 'var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            Payment
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main-col">
            {step === 1 ? (
              <form onSubmit={nextStep}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Shipping Details</h2>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>Use a saved address:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {savedAddresses.map(addr => (
                          <button key={addr.id} type="button" onClick={() => selectAddress(addr)} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${selectedAddressId === addr.id ? 'var(--primary-blue)' : 'var(--border-color)'}`, background: selectedAddressId === addr.id ? '#eff6ff' : 'white', cursor: 'pointer', textAlign: 'left', flex: '1 1 200px', transition: 'all 0.2s' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedAddressId === addr.id ? 'var(--primary-blue)' : 'inherit' }}>{addr.label}: {addr.full_name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{addr.address_line1}, {addr.city}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="checkout-input-group">
                    <input required type="text" name="billingAddress1" placeholder="Address (House No, Street, Area)" value={formData.billingAddress1} onChange={handleChange} />
                    <div className="checkout-input-row">
                      <input required type="text" name="billingCity" placeholder="City" value={formData.billingCity} onChange={handleChange} />
                      <input required type="text" name="billingState" placeholder="State" value={formData.billingState} onChange={handleChange} />
                    </div>
                    <input required type="text" name="billingPincode" placeholder="PIN Code" value={formData.billingPincode} onChange={handleChange} />
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {token && !selectedAddressId && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: saveAddress ? '#f0fdf4' : '#f8fafc', border: `1px solid ${saveAddress ? '#bbf7d0' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} style={{ width: 'auto', transform: 'scale(1.2)' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Save this address to my account</span>
                      </label>
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: formData.sameAsBilling ? '#f0f9ff' : '#f8fafc', border: `1px solid ${formData.sameAsBilling ? '#bae6fd' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleChange} style={{ width: 'auto', transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Shipping address is same as billing</span>
                    </label>
                  </div>
                </div>

                {!formData.sameAsBilling && (
                  <div className="form-group-section animate-fade-in" style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '2rem', marginTop: '2rem' }}>
                    <h2>Shipping Address</h2>
                    <div className="checkout-input-group">
                      <input required type="text" name="shippingAddress1" placeholder="Address (House No, Street, Area)" value={formData.shippingAddress1} onChange={handleChange} />
                      <div className="checkout-input-row">
                        <input required type="text" name="shippingCity" placeholder="City" value={formData.shippingCity} onChange={handleChange} />
                        <input required type="text" name="shippingState" placeholder="State" value={formData.shippingState} onChange={handleChange} />
                      </div>
                      <input required type="text" name="shippingPincode" placeholder="PIN Code" value={formData.shippingPincode} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ marginTop: '2.5rem', width: '100%', padding: '1.25rem', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)' }}>
                  Continue to Payment <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
              </form>
            ) : (
              <div className="animate-fade-in">
                <button onClick={prevStep} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                  <ArrowLeft size={16} /> Edit Address
                </button>

                <div className="form-group-section">
                  <h2>Payment</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', border: `2px solid ${paymentMethod === 'online' ? 'var(--primary-blue)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: paymentMethod === 'online' ? '#eff6ff' : 'white', transition: 'all 0.2s' }}>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ transform: 'scale(1.3)' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Pay Online</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Secure payment via Razorpay</div>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary-blue)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: paymentMethod === 'cod' ? '#eff6ff' : 'white', transition: 'all 0.2s' }}>
                      <input type="radio" name="payMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ transform: 'scale(1.3)' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Cash on Delivery</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Pay at your doorstep</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button onClick={handlePayment} className="btn-primary" disabled={isProcessing} style={{ width: '100%', padding: '1.5rem', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>
                  {isProcessing ? 'Processing...' : (paymentMethod === 'cod' ? 'Confirm Order' : `Pay ₹${total.toFixed(0)} Now`)}
                </button>
              </div>
            )}
          </div>

          <div className="checkout-sidebar-col">
              <div className="order-summary-box" style={{ position: 'sticky', top: '7rem' }}>
                <h3>Order Summary</h3>
                
                {/* Free Shipping Promotion */}
                <div style={{ 
                  background: isFreeShipping ? '#f0fdf4' : '#eff6ff',
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  border: `1px solid ${isFreeShipping ? '#bbf7d0' : '#bfdbfe'}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isFreeShipping ? '#166534' : '#1e40af',
                  textAlign: 'center'
                }}>
                  {isFreeShipping ? '🎉 Free Shipping Unlocked!' : `🚚 Add ₹${1500 - subtotal} more for FREE Shipping!`}
                </div>

                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.cartItemId} className="summary-item-row">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="coupon-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" placeholder="Promo Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                    <button onClick={handleApplyCoupon} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1rem' }}>Apply</button>
                  </div>
                  {couponStatus && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: discount > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{couponStatus}</p>}
                </div>

                <div className="summary-totals" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="summary-item-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="summary-item-row">
                    <span>Shipping</span>
                    <span style={{ color: isFreeShipping ? '#10b981' : 'inherit', fontWeight: isFreeShipping ? 700 : 'inherit' }}>
                      {isFreeShipping ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                  {discount > 0 && <div className="summary-item-row" style={{ color: '#10b981', fontWeight: 600 }}><span>Discount Applied</span><span>-₹{discount.toFixed(0)}</span></div>}
                  <div className="summary-item-row total-row" style={{ fontSize: '1.4rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                    <span>Total</span><span>₹{total.toFixed(0)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <ShieldCheck size={16} /> 100% Secure Checkout
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
