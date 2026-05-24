import React from 'react';
import CustomPrintForm from '../components/CustomPrintForm';

const CustomPrint = () => {
  return (
    <div className="page-transition animate-fade-in page-container" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <h1 className="page-title">Custom 3D Printing Service</h1>
          <p className="page-subtitle" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Have your own STL or OBJ file? Upload it here and specify your requirements. 
            We'll review your model and send you a custom quote within 24 hours.
          </p>
        </div>
        
        {/* Compliance Warning Card */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 2.5rem',
          padding: '1.5rem 2rem',
        }} className="compliance-card">
          <span style={{ fontSize: '1.75rem', lineHeight: '1' }}>⚠️</span>
          <div>
            <h4 style={{ color: '#92400e', marginBottom: '0.25rem', fontWeight: '700', fontSize: '1rem' }}>Safety & Compliance Policy</h4>
            <p style={{ color: '#b45309', fontSize: '0.875rem', lineHeight: '1.6', margin: '0' }}>
              We are strictly committed to safety and regulatory compliance. We do <strong>NOT</strong> manufacture or print weapons, functional firearm components, drones, quadcopters, UAV parts, aerospace components, or regulated industrial/military equipment. Submissions containing any such models will be automatically rejected, and any payments will be refunded immediately.
            </p>
          </div>
        </div>
        
        <CustomPrintForm />
        
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '2rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Upload File</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Submit your 3D model with your preferred material and infill settings.</p>
            </div>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Get a Quote</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We review the file for printability and email you a competitive quote.</p>
            </div>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
              <h4 style={{ marginBottom: '0.5rem' }}>We Print</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Once approved, we print your model using our premium machines.</p>
            </div>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>4</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Delivery</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your model is carefully packaged and shipped to your door.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPrint;
