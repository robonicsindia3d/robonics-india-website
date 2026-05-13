import React from 'react';

const Refunds = () => (
  <div className="page-transition container" style={{ paddingTop: '8rem', paddingBottom: '6rem', maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '2rem' }}>Cancellation & Refund Policy</h1>
    <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
      <p>We want you to be completely satisfied with your 3D printed figures.</p>
      
      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Cancellations</h3>
      <p>You may cancel your order within 24 hours of placing it for a full refund. Once printing has started or the item has shipped, cancellations are not accepted.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Damages</h3>
      <p>If your product arrives broken or damaged due to transit, please email us within 48 hours of delivery with photos. We will gladly send a replacement at no extra cost.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Returns</h3>
      <p>Because these are custom manufactured items, we do not accept returns for "change of mind". Refunds are only issued for defective or severely delayed products.</p>
    </div>
  </div>
);

export default Refunds;
