import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import SEO from '../components/SEO';

const Home = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProductsData(data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-transition animate-fade-in">
      <SEO 
        title="Home" 
        description="Shop the best 3D printed anime figures in India. High quality, premium materials, and custom printing services available." 
        url="/" 
      />
      <HeroSection />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}><p>Loading featured products...</p></div>
      ) : (
        <ProductGrid products={productsData} limit={4} />
      )}
      
      <section className="features-section" style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Why Choose RobonicsIndia 3D?</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Premium quality is our standard.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>Ultra-High Detail</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We use state-of-the-art resin and FDM printers to capture every micro-detail of your favorite characters.</p>
            </div>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>Custom Painted</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Optional hand-painting services available to bring your figures to life with accurate, vibrant colors.</p>
            </div>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>Durable Materials</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Printed with premium filaments and resins that resist fading, warping, and breakage over time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
