const Shipping = () => (
  <div className="page-transition container" style={{ paddingTop: '8rem', paddingBottom: '6rem', maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '2rem' }}>Shipping Policy</h1>
    <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
      <p>Information regarding the shipping of your 3D printed orders.</p>
      
      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Processing Time</h3>
      <p>Most orders are printed and processed within 3-5 business days. Complex or large custom prints may take up to 10 days.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Shipping Times</h3>
      <p>Once dispatched, delivery typically takes 4-7 business days across India depending on your location.</p>

      <h3 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Shipping Costs</h3>
      <p>Shipping costs are calculated dynamically at checkout based on your delivery pincode, the total weight of the products, and the chosen payment method. We use Shiprocket to provide the most accurate and competitive courier rates available.</p>
    </div>
  </div>
);

export default Shipping;
