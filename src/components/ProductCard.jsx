import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [selectedVariants, setSelectedVariants] = useState({});
  
  useEffect(() => {
    // Set default variants (first choice of each option)
    const defaults = {};
    if (product.variants?.options) {
      product.variants.options.forEach(opt => {
        if (opt.choices && opt.choices.length > 0) {
          defaults[opt.name] = opt.choices[0];
        }
      });
    }
    setSelectedVariants(defaults);
  }, [product.variants]);

  // Calculate price dynamically
  let currentPrice = product.price || 0;
  let variantLabelArray = [];
  
  if (product.variants?.options) {
    Object.keys(selectedVariants).forEach(optName => {
      const choice = selectedVariants[optName];
      if (choice) {
        currentPrice += (choice.priceModifier || 0);
        variantLabelArray.push(choice.label);
      }
    });
  }
  
  const variantLabel = variantLabelArray.length > 0 ? variantLabelArray.join(' / ') : '';
  const isWishlisted = isInWishlist(product.id);

  // For the quick card layout, we'll only show the choices of the FIRST option (e.g. Size)
  const primaryOption = product.variants?.options?.[0];

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
            src={product.image.startsWith('http') ? product.image : encodeURI(product.image)} 
            alt={product.name} 
            className="product-image"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "/Group 1.png";
            }}
          />
        </Link>
        <div className="product-overlay">
          <button className="btn-primary add-to-cart-btn" onClick={(e) => { e.preventDefault(); addToCart(product, variantLabel, currentPrice); }}>
            <ShoppingCart size={18} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="product-name" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-blue)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>{product.name}</h3>
        </Link>
        
        {primaryOption && (
          <div className="card-size-selector">
            {primaryOption.choices.map(choice => (
              <button 
                key={choice.label}
                className={`card-size-btn ${selectedVariants[primaryOption.name]?.label === choice.label ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariants(prev => ({ ...prev, [primaryOption.name]: choice }));
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

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
