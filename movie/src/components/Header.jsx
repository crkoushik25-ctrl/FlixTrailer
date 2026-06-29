import { useState } from 'react';
import { Search, User, LogOut, Flame, Menu, X } from 'lucide-react';

export default function Header({ 
  activePage, 
  setActivePage, 
  searchQuery, 
  setSearchQuery, 
  user, 
  onLogout 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        {/* Logo */}
        <a 
          href="#" 
          className="logo-link"
          onClick={(e) => {
            e.preventDefault();
            setActivePage('home');
            setIsMobileMenuOpen(false);
          }}
        >
          <Flame className="logo-icon" size={28} fill="currentColor" />
          <span>FlixTrailer</span>
        </a>

        {/* Live Search */}
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search movies, anime, web series..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="nav-links">
          <span 
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Home
          </span>
          <span 
            className={`nav-item ${activePage === 'favourite' ? 'active' : ''}`}
            onClick={() => setActivePage('favourite')}
          >
            Favourites
          </span>
          <span 
            className={`nav-item ${activePage === 'watch-later' ? 'active' : ''}`}
            onClick={() => setActivePage('watch-later')}
          >
            Watch Later
          </span>
          <span 
            className={`nav-item ${activePage === 'admin' ? 'active' : ''}`}
            onClick={() => setActivePage('admin')}
          >
            Admin
          </span>
        </nav>

        {/* Profile / Auth Control */}
        <div className="header-right">
          {user ? (
            <div className="user-profile" onClick={() => { setActivePage('login'); setIsMobileMenuOpen(false); }}>
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="username">{user.username}</span>
              <button 
                className="icon-btn" 
                style={{ width: '32px', height: '32px', border: 'none' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => { setActivePage('login'); setIsMobileMenuOpen(false); }}
              style={{ padding: '0.5rem 1.1rem', borderRadius: '20px', fontSize: '0.85rem' }}
            >
              <User size={15} />
              Sign In
            </button>
          )}

          {/* Hamburger Menu Toggle for Mobile */}
          <button 
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobile-nav animate-scale" onClick={(e) => e.stopPropagation()}>
            <span 
              className={`mobile-nav-item ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('home');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </span>
            <span 
              className={`mobile-nav-item ${activePage === 'favourite' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('favourite');
                setIsMobileMenuOpen(false);
              }}
            >
              Favourites
            </span>
            <span 
              className={`mobile-nav-item ${activePage === 'watch-later' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('watch-later');
                setIsMobileMenuOpen(false);
              }}
            >
              Watch Later
            </span>
            <span 
              className={`mobile-nav-item ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('admin');
                setIsMobileMenuOpen(false);
              }}
            >
              Admin
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
