import React from 'react';

const PrivacyPolicy = () => (
  <div className="page-transition container" style={{ paddingTop: '8rem', paddingBottom: '6rem', maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
    <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
      <p>At RobonicsIndia 3D, we take your privacy seriously. This policy explains how we collect and use your data.</p>
      
      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Data Collection</h3>
      <p>We collect your name, email, phone number, and address strictly for the purpose of fulfilling your orders.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Payment Information</h3>
      <p>We do not store your credit card or UPI details. All transactions are securely processed via Razorpay.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Third-Party Sharing</h3>
      <p>We only share your address and phone number with our shipping partners to deliver your products. We never sell your data.</p>
    </div>
  </div>
);

export default PrivacyPolicy;
