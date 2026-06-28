import { Flame } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="footer animate-fade">
      <div className="container footer-container">
        {/* Branding Logo */}
        <div className="footer-logo">
          <Flame size={20} className="logo-icon" fill="currentColor" />
          <span>FlixTrailer</span>
        </div>

        {/* Dynamic Nav Toggles */}
        <div className="footer-links">
          <span className="footer-link-item" onClick={() => setActivePage('home')}>
            Home
          </span>
          <span className="footer-link-item" onClick={() => setActivePage('favourite')}>
            Favourites
          </span>
          <span className="footer-link-item" onClick={() => setActivePage('watch-later')}>
            Watch Later
          </span>
          <span className="footer-link-item" onClick={() => setActivePage('login')}>
            Account Profile
          </span>
        </div>

        {/* Divider and Copyright */}
        <div 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: '1px', 
            background: 'var(--border-color)', 
            margin: '0.5rem 0' 
          }} 
        />
        
        <p className="footer-copyright">
          © {new Date().getFullYear()} FlixTrailer Inc. All media assets, trailer embeds and posters are property of their respective creators. Crafted for cinema fans.
        </p>
      </div>
    </footer>
  );
}
