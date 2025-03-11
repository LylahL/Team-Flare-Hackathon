
import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Immigration Helper</h1>
          <p>Your comprehensive platform for navigating the immigration process with ease and confidence.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">Get Started</Link>
            <Link to="/learn-more" className="cta-button secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Document Preparation</h3>
            <p>Guided assistance in preparing and organizing all required immigration documents.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Case Tracking</h3>
            <p>Real-time updates and notifications about your immigration case status.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Get instant answers to your immigration questions through our AI-powered assistant.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Support</h3>
            <p>Connect with others going through similar immigration journeys for advice and support.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up and complete your profile with your immigration information.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Access Resources</h3>
            <p>Browse through our comprehensive library of immigration resources and guides.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Your Case</h3>
            <p>Enter your case details and receive regular updates on its progress.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Support</h3>
            <p>Connect with our AI assistant or community for help with any questions.</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>Success Stories</h2>
        <div className="testimonial-container">
          <div className="testimonial">
            <p>"This platform made my immigration process so much easier to understand and navigate. I'm now a proud permanent resident!"</p>
            <h4>- Maria C.</h4>
          </div>
          <div className="testimonial">
            <p>"The case tracking feature kept me informed every step of the way. No more uncertainty about where my application stood."</p>
            <h4>- Ahmed K.</h4>
          </div>
          <div className="testimonial">
            <p>"The community support was invaluable. I connected with others who had been through the same process and their advice was priceless."</p>
            <h4>- Priya S.</h4>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

