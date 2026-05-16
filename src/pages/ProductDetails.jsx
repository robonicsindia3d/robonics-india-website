import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import SEO from '../components/SEO';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  
  // selectedVariants: { "Size": "15cm", "Material": "Resin" }
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const p = data.product;
          setProduct(p);
          setMainImage(p.image);
          
          // Set default variants (first choice of each option)
          const defaults = {};
          if (p.variants?.options) {
            p.variants.options.forEach(opt => {
              if (opt.choices && opt.choices.length > 0) {
                defaults[opt.name] = opt.choices[0];
              }
            });
          }
          setSelectedVariants(defaults);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Calculate price dynamically
  let currentPrice = product?.price || 0;
  let variantLabelArray = [];
  
  if (product && product.variants?.options) {
    Object.keys(selectedVariants).forEach(optName => {
      const choice = selectedVariants[optName];
      if (choice) {
        currentPrice += (choice.priceModifier || 0);
        variantLabelArray.push(choice.label);
      }
    });
  }
  
  const variantLabel = variantLabelArray.length > 0 ? variantLabelArray.join(' / ') : '';

  if (loading) {
    return <div className="page-transition container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '60vh' }}><h2>Loading product...</h2></div>;
  }

  if (!product) {
    return (
      <div className="page-transition container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '60vh' }}>
        <SEO title="Product Not Found" />
        <h2>Product Not Found</h2>
        <button className="btn-secondary mt-4" onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, variantLabel, currentPrice);
  };

  return (
    <div className="page-transition animate-fade-in product-details-page" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
      <SEO 
        title={product.name} 
        description={product.description ? product.description.substring(0, 160) : `Buy ${product.name} 3D Printed Figure. Premium ${product.category} merchandise.`} 
        image={product.image}
        url={`/product/${product.id}`} 
      />
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>

        <div className="product-details-layout">
          {/* Left Column: Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img 
                src={mainImage ? (mainImage.startsWith('http') ? mainImage : encodeURI(mainImage)) : (product.image?.startsWith('http') ? product.image : encodeURI(product.image || ''))} 
                alt={product.name} 
                className="main-image" 
                onError={(e) => { e.target.src = '/Group 1.png'; }}
              />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="thumbnail-list scrollable-tabs" style={{ paddingBottom: '10px' }}>
                {[...new Set([product.image, ...product.images])].slice(0, 15).map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumbnail-btn ${mainImage === img ? 'active' : ''}`}
                    onClick={() => setMainImage(img)}
                  >
                    <img src={img.startsWith('http') ? img : encodeURI(img)} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="product-info-section">
            <div className="product-category-tag">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="price-main">₹{currentPrice}</span>
                {/* Visual discount for marketing */}
                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                  ₹{Math.round(currentPrice / 0.8)}
                </span>
                <span style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  20% OFF
                </span>
              </div>
              <span className="price-shipping">Tax included.</span>
            </div>
            
            <p className="product-description" style={{ whiteSpace: 'pre-wrap' }}>
              {product.description || `High-quality, meticulously detailed 3D printed figure of ${product.name}. Manufactured with premium materials to ensure the best durability and visual fidelity. Perfect for collectors and enthusiasts.`}
            </p>
            
            {/* Dynamic Variant Selectors */}
            {product.variants?.options?.map((option, idx) => (
              <div key={idx} className="size-selector-container">
                <h4 className="size-selector-title">{option.name}</h4>
                <div className="size-buttons">
                  {option.choices.map((choice, cIdx) => {
                    const isSelected = selectedVariants[option.name]?.label === choice.label;
                    return (
                      <button 
                        key={cIdx}
                        className={`size-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [option.name]: choice }))}
                      >
                        {choice.label} {choice.priceModifier > 0 ? `(+₹${choice.priceModifier})` : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <button 
              className="btn-primary add-to-cart-large" 
              onClick={handleAddToCart}
            >
              <ShoppingCart size={22} /> Add to Cart - ₹{currentPrice}
            </button>
            {product.stock <= 0 ? (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--primary-blue)', borderRadius: '4px' }}>
                <p style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                  High Demand Notice: This item is currently being made-to-order. 
                  Shipping might take 4-5 days as product is high in demand.
                </p>
              </div>
            ) : product.stock <= 5 && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem' }}>Only {product.stock} left in stock - order soon!</p>
            )}

            <div className="trust-badges">
              <div className="trust-badge">
                <ShieldCheck size={24} className="trust-icon" />
                <div>
                  <h4>Secure Payment</h4>
                  <p>100% secure checkout via Razorpay</p>
                </div>
              </div>
              <div className="trust-badge">
                <Truck size={24} className="trust-icon" />
                <div>
                  <h4>Safe Delivery</h4>
                  <p>Carefully packaged to prevent transit damage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
