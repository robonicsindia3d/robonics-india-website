import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [selectedSize, setSelectedSize] = useState('10cm');
  
  const sizePricing = {
    '10cm': product.price,
    '15cm': 799,
    '25cm': 1499
  };
  
  const currentPrice = sizePricing[selectedSize];
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="product-card animate-fade-in">
      <div className="product-image-container">
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
        >
          <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
        </button>
        {product.stock <= 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary-blue)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, zIndex: 5 }}>HIGH DEMAND</div>
        )}
        <Link to={`/product/${product.id}`}>
          <img 
            src={encodeURI(product.image)} 
            alt={product.name} 
            className="product-image"
            onError={(e) => {
              // Try removing the leading slash if it fails, or fallback to a neutral placeholder
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/400x400?text=RobonicsIndia+3D";
            }}
          />
        </Link>
        <div className="product-overlay">
          <button className="btn-primary add-to-cart-btn" onClick={(e) => { e.preventDefault(); addToCart(product, selectedSize, currentPrice); }}>
            <ShoppingCart size={18} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="product-name" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-blue)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>{product.name}</h3>
        </Link>
        
        <div className="card-size-selector">
          {['10cm', '15cm', '25cm'].map(size => (
            <button 
              key={size}
              className={`card-size-btn ${selectedSize === size ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedSize(size);
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="product-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="product-price">₹{currentPrice}</span>
            <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              ₹{Math.round(currentPrice / 0.8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
