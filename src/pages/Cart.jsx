import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="page-transition animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '60vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', marginBottom: '2rem' }}>
            <ShoppingCart size={64} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h1 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
            Looks like you haven't added any anime figures to your cart yet.
          </p>
          <Link to="/shop" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 99;
  const total = subtotal + shipping;

  return (
    <div className="page-transition animate-fade-in cart-page" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '60vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Your Shopping Cart</h1>
        
        {/* Free Shipping Promotion */}
        <div style={{ 
          background: subtotal >= 1500 ? 'linear-gradient(90deg, #dcfce7, #f0fdf4)' : 'linear-gradient(90deg, #eff6ff, #f8fafc)',
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '2rem',
          border: `1px solid ${subtotal >= 1500 ? '#86efac' : '#bfdbfe'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: subtotal >= 1500 ? '#166534' : '#1e40af'
        }}>
          {subtotal >= 1500 ? (
            <>🎉 You've unlocked <strong>FREE SHIPPING!</strong></>
          ) : (
            <>🚚 Add ₹{1500 - subtotal} more to get <strong>FREE SHIPPING!</strong></>
          )}
        </div>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="cart-item">
                <Link to={`/product/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={item.image.startsWith('http') ? item.image : encodeURI(item.image)} alt={item.name} className="cart-item-image" />
                </Link>
                <div className="cart-item-details">
                  <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="cart-item-name" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-blue)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>{item.name}</h3>
                  </Link>
                  <p className="cart-item-category" style={{ marginBottom: '0.5rem' }}>{item.category}</p>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                      Variant: {item.variantLabel || 'Standard'}
                    </span>
                  </div>
                  
                  <p className="cart-item-price">₹{item.price}</p>
                  {item.stock <= 0 && (
                    <p style={{ color: 'var(--primary-blue)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      Shipping might take 4-5 days as product high in demand
                    </p>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ fontWeight: subtotal >= 1500 ? 700 : 400, color: subtotal >= 1500 ? '#10b981' : 'inherit' }}>
                {subtotal >= 1500 ? 'FREE' : '₹99'}
              </span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{subtotal >= 1500 ? subtotal : subtotal + 99}</span>
            </div>
            
            <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={20} />
            </button>
            <Link to="/shop" className="continue-shopping-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
