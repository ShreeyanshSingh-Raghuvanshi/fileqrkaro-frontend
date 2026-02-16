import { motion } from 'framer-motion';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <motion.main 
      className="privacy-page"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <motion.section
        className="privacy-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="privacy-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Privacy <span className="gradient-text">Policy</span>
        </motion.h1>
        <p className="privacy-subtitle">Last Updated: {new Date().toLocaleDateString()}</p>
      </motion.section>

      <motion.section
        className="privacy-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect basic usage data and files you explicitly upload. Files are temporarily stored to generate QR codes.</p>
        </section>

        <section>
          <h2>2. Google AdSense & Cookies</h2>
          <p>We use Google AdSense to serve ads. Google uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings.</p>
        </section>

        <section>
          <h2>3. Data Retention</h2>
          <p><strong>Security Note:</strong> All uploaded files are automatically and permanently deleted from our servers 24 hours after upload.</p>
        </section>
        
        <section>
          <h2>4. Contact</h2>
          <p>For privacy concerns, contact: keshavdv241@gmail.com</p>
        </section>
      </motion.section>
    </motion.main>
  );
};

export default PrivacyPolicy;