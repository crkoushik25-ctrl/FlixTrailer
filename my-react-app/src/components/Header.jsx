import { Search, User, LogOut, Flame } from 'lucide-react';

export default function Header({ 
  activePage, 
  setActivePage, 
  searchQuery, 
  setSearchQuery, 
  user, 
  onLogout 
}) {
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

        {/* Navigation Tabs */}
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
            <div className="user-profile" onClick={() => setActivePage('login')}>
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
                }}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => setActivePage('login')}
              style={{ padding: '0.5rem 1.1rem', borderRadius: '20px', fontSize: '0.85rem' }}
            >
              <User size={15} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
