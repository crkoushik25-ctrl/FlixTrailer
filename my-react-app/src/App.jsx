import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import TrailerModal from './components/TrailerModal';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { Heart, Clock, Search, ShieldAlert } from 'lucide-react';
import './App.css';

const contentTypes = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'anime', label: 'Anime' },
  { value: 'web-series', label: 'Web Series' }
];

const contentTypeLabels = {
  movie: 'Movies',
  anime: 'Anime',
  'web-series': 'Web Series'
};

const getContentType = (item) => item.contentType || 'movie';

function App() {
  // Navigation & Page State
  const [activePage, setActivePage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  // Dynamic API States
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favourites & Watch Later State (with LocalStorage persistence)
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem('flixtrailer_favourites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [watchLater, setWatchLater] = useState(() => {
    const saved = localStorage.getItem('flixtrailer_watch_later');
    return saved ? JSON.parse(saved) : [];
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('flixtrailer_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Fetch movies from local API on mount
  useEffect(() => {
    const isTest = import.meta.env.MODE === 'test';
    
    const loadData = () => {
      fetch('/api/movies.json')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setMovies(data);
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching movies database:", err);
          setError("Failed to load the movies database. Please check your network connection and server state.");
          setIsLoading(false);
        });
    };

    if (isTest) {
      loadData();
    } else {
      const timer = setTimeout(loadData, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync state modifications back to local storage
  useEffect(() => {
    localStorage.setItem('flixtrailer_favourites', JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem('flixtrailer_watch_later', JSON.stringify(watchLater));
  }, [watchLater]);

  // Handle Search input changes: redirect to home if they are typing elsewhere
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query && activePage !== 'home') {
      setActivePage('home');
    }
  };

  // Toggle Actions
  const handleToggleFavourite = (id) => {
    setFavourites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleWatchLater = (id) => {
    setWatchLater((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('flixtrailer_user', JSON.stringify(userData));
    setActivePage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flixtrailer_user');
    setActivePage('home');
  };

  // Filter movies based on page, selected category, and search query
  const getFilteredMovies = () => {
    let sourceMovies = movies;

    // Filter by page first
    if (activePage === 'favourite') {
      sourceMovies = movies.filter((m) => favourites.includes(m.id));
    } else if (activePage === 'watch-later') {
      sourceMovies = movies.filter((m) => watchLater.includes(m.id));
    }

    // Filter by home page content tabs and genre tabs
    if (activePage === 'home') {
      if (selectedContentType !== 'all') {
        sourceMovies = sourceMovies.filter((m) => getContentType(m) === selectedContentType);
      }

      if (selectedGenre !== 'All') {
        sourceMovies = sourceMovies.filter((m) => (m.genres || []).includes(selectedGenre));
      }
    }

    // Filter by Search Query (title, tagline, genres, cast, director)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      sourceMovies = sourceMovies.filter((m) => 
        m.title.toLowerCase().includes(query) ||
        (m.tagline || '').toLowerCase().includes(query) ||
        (m.director || '').toLowerCase().includes(query) ||
        (contentTypeLabels[getContentType(m)] || '').toLowerCase().includes(query) ||
        (m.genres || []).some(g => g.toLowerCase().includes(query)) ||
        (m.cast || []).some(c => c.toLowerCase().includes(query))
      );
    }

    // Sort movies based on selected criterion
    if (sortBy === 'rating') {
      sourceMovies = [...sourceMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'year-desc') {
      sourceMovies = [...sourceMovies].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'year-asc') {
      sourceMovies = [...sourceMovies].sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortBy === 'title-asc') {
      sourceMovies = [...sourceMovies].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      sourceMovies = [...sourceMovies].sort((a, b) => b.title.localeCompare(a.title));
    }

    return sourceMovies;
  };

  // Render headers and loading spinners if API is resolving
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          activePage={activePage} 
          setActivePage={setActivePage}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          user={user}
          onLogout={handleLogout}
        />
        <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loader-container animate-fade">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', fontWeight: 500, letterSpacing: '0.5px' }}>Loading FlixTrailer Database...</p>
          </div>
        </main>
        <Footer setActivePage={setActivePage} />
      </div>
    );
  }

  // Render headers and error warning banner if API retrieval fails
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          activePage={activePage} 
          setActivePage={setActivePage}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          user={user}
          onLogout={handleLogout}
        />
        <main className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="error-container animate-fade">
            <div className="error-card glass">
              <ShieldAlert className="error-icon" size={48} />
              <h3 className="error-title">Database Error</h3>
              <p className="error-desc">{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Retry Connection
              </button>
            </div>
          </div>
        </main>
        <Footer setActivePage={setActivePage} />
      </div>
    );
  }

  const filteredMovies = getFilteredMovies();
  const homeBaseMovies = selectedContentType === 'all'
    ? movies
    : movies.filter((m) => getContentType(m) === selectedContentType);
  const availableGenres = [
    'All',
    ...Array.from(new Set(homeBaseMovies.flatMap((m) => m.genres || []))).sort()
  ];
  const featuredMovies = homeBaseMovies.filter((m) => m.featured).length > 0 
    ? homeBaseMovies.filter((m) => m.featured) 
    : homeBaseMovies.slice(0, 5);
  const contentCounts = contentTypes.reduce((acc, type) => {
    acc[type.value] = type.value === 'all'
      ? movies.length
      : movies.filter((m) => getContentType(m) === type.value).length;
    return acc;
  }, {});
  const activeContentLabel = selectedContentType === 'all'
    ? 'Movie, Anime & Web Series'
    : contentTypeLabels[selectedContentType];
  const gridTitle = searchQuery 
    ? `Search Results for "${searchQuery}"` 
    : selectedGenre === 'All' 
      ? `Trending ${activeContentLabel} Trailers`
      : `${selectedGenre} ${activeContentLabel} Trailers`;

  return (
    <>
      {/* Header */}
      <Header 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          // Scroll back to top on navigation change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, paddingBottom: '4rem' }}>
        {activePage === 'home' && (
          <>
            {/* Home Content Category Nav */}
            <div className="content-nav" aria-label="Content categories">
              {contentTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  className={`content-nav-item ${selectedContentType === type.value ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedContentType(type.value);
                    setSelectedGenre('All');
                  }}
                >
                  <span>{type.label}</span>
                  <span className="content-nav-count">{contentCounts[type.value] || 0}</span>
                </button>
              ))}
            </div>

            {/* Show featured trailer banner only when search query & genre filters are cleared */}
            {!searchQuery && selectedGenre === 'All' && (
              <Hero 
                movies={featuredMovies}
                onPlay={setSelectedMovie}
                favourites={favourites}
                watchLater={watchLater}
                onToggleFavourite={handleToggleFavourite}
                onToggleWatchLater={handleToggleWatchLater}
              />
            )}

            {/* Genre Pill Selection Tabs */}
            {!searchQuery && (
              <div className="genre-container">
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* Trailers Grid */}
            <MovieGrid 
              movies={filteredMovies}
              title={gridTitle}
              onPlay={setSelectedMovie}
              favourites={favourites}
              watchLater={watchLater}
              onToggleFavourite={handleToggleFavourite}
              onToggleWatchLater={handleToggleWatchLater}
              emptyIcon={Search}
              emptyTitle="No trailers found"
              emptyDesc={`We couldn't find any trailers matching your criteria. Try adjusting your filters or spelling.`}
              emptyActionText={searchQuery || selectedGenre !== 'All' ? "Reset Filters" : null}
              onEmptyAction={() => {
                setSearchQuery('');
                setSelectedGenre('All');
              }}
              showSort={true}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </>
        )}

        {activePage === 'favourite' && (
          <MovieGrid 
            movies={filteredMovies}
            title="My Favourite Trailers"
            onPlay={setSelectedMovie}
            favourites={favourites}
            watchLater={watchLater}
            onToggleFavourite={handleToggleFavourite}
            onToggleWatchLater={handleToggleWatchLater}
            emptyIcon={Heart}
            emptyTitle="Your Favourites is Empty"
            emptyDesc="Click the heart icon on any movie poster to save its trailer to your list."
            emptyActionText="Browse Trailers"
            onEmptyAction={() => setActivePage('home')}
            showSort={true}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {activePage === 'watch-later' && (
          <MovieGrid 
            movies={filteredMovies}
            title="Watch Later Queue"
            onPlay={setSelectedMovie}
            favourites={favourites}
            watchLater={watchLater}
            onToggleFavourite={handleToggleFavourite}
            onToggleWatchLater={handleToggleWatchLater}
            emptyIcon={Clock}
            emptyTitle="Watch Later Queue is Empty"
            emptyDesc="Save trailers here to watch them later when you have time."
            emptyActionText="Discover Trailers"
            onEmptyAction={() => setActivePage('home')}
            showSort={true}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {activePage === 'login' && (
          <LoginForm 
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            favouritesCount={favourites.length}
            watchLaterCount={watchLater.length}
          />
        )}

        {activePage === 'admin' && (
          <AdminPanel 
            onAddMovie={(savedMovie) => {
              setMovies((prev) => {
                const exists = prev.some(m => m.id === savedMovie.id);
                if (exists) {
                  return prev.map(m => m.id === savedMovie.id ? savedMovie : m);
                } else {
                  if (savedMovie.featured) {
                    return [savedMovie, ...prev];
                  } else {
                    return [...prev, savedMovie];
                  }
                }
              });
            }}
            onDeleteMovie={(movieId) => {
              setMovies((prev) => prev.filter(m => m.id !== movieId));
            }}
            onReorderMovies={(orderedMovies) => setMovies(orderedMovies)}
            existingMovies={movies}
          />
        )}
      </main>

      {/* Immersive Trailer Playback Modal */}
      {selectedMovie && (
        <TrailerModal 
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          isFavourite={favourites.includes(selectedMovie.id)}
          isWatchLater={watchLater.includes(selectedMovie.id)}
          onToggleFavourite={handleToggleFavourite}
          onToggleWatchLater={handleToggleWatchLater}
        />
      )}

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </>
  );
}

export default App;
