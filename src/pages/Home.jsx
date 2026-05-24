import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import SEO from '../components/SEO';

const Home = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/products`)
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

      {/* Trust & Compliance Reassurance Banner */}
      <section className="compliance-banner" style={{ padding: '3rem 0', background: 'white' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>🎨</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontWeight: '700' }}>Artistic Figurine & Craft Studio</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', margin: '0 auto', maxWidth: '750px' }}>
              RobonicsIndia 3D is a dedicated creative printing hub. We design and manufacture high-fidelity plastic anime figures, custom tabletop models, and novelty gifts. <strong>Please Note:</strong> We strictly operate as a decorative craft shop and do NOT sell, supply, or design drones, aircraft electronics, telemetry equipment, or commercial robotics machinery.
            </p>
          </div>
        </div>
      </section>
      
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
