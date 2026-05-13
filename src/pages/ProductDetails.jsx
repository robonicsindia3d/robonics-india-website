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
  const [selectedSize, setSelectedSize] = useState('10cm');
  
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.product);
          setMainImage(data.product.image);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const sizePricing = {
    '10cm': product ? product.price : 399,
    '15cm': 799,
    '25cm': 1499
  };
  
  const currentPrice = sizePricing[selectedSize];

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

  return (
    <div className="page-transition animate-fade-in product-details-page" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
      <SEO 
        title={product.name} 
        description={`Buy ${product.name} 3D Printed Figure. Premium ${product.category} merchandise. Scale 1/${product.scale}.`} 
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
              <img src={mainImage} alt={product.name} className="main-image" />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.slice(0, 5).map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumbnail-btn ${mainImage === img ? 'active' : ''}`}
                    onClick={() => setMainImage(img)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
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
                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                  ₹{Math.round(currentPrice / 0.8)}
                </span>
                <span style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  20% OFF
                </span>
              </div>
              <span className="price-shipping">Tax included.</span>
            </div>
            
            <p className="product-description">
              High-quality, meticulously detailed 3D printed figure of {product.name}. 
              Manufactured with premium materials to ensure the best durability and visual fidelity. 
              Perfect for collectors and anime enthusiasts.
            </p>
            
            <div className="size-selector-container">
              <h4 className="size-selector-title">Select Size (Height)</h4>
              <div className="size-buttons">
                {['10cm', '15cm', '25cm'].map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn-primary add-to-cart-large" 
              onClick={() => addToCart(product, selectedSize, currentPrice)}
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
