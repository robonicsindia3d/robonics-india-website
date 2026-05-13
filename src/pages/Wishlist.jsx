import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { HeartCrack } from 'lucide-react';
import '../components/ProductGrid.css';

const Wishlist = () => {
  const { wishlistItems } = useContext(WishlistContext);
  const navigate = useNavigate();

  return (
    <div className="page-transition animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Your Wishlist</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
        
        {wishlistItems.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <HeartCrack size={64} style={{ color: 'var(--border-color)', margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Save your favorite 3D prints here to buy them later!
            </p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Browse Shop
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {wishlistItems.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
