import React from 'react';
import CustomPrintForm from '../components/CustomPrintForm';

const CustomPrint = () => {
  return (
    <div className="page-transition animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '4rem', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ marginBottom: '1rem', fontSize: '3rem' }}>Custom 3D Printing Service</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
            Have your own STL or OBJ file? Upload it here and specify your requirements. 
            We'll review your model and send you a custom quote within 24 hours.
          </p>
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
