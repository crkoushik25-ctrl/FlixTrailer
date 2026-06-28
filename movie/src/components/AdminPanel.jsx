import { useState, useEffect } from 'react';
import { Film, Search, Plus, Trash2, Video, Image, Check, AlertCircle, Lock, Shield, GripVertical } from 'lucide-react';

const AVAILABLE_GENRES = ["Action", "Adventure", "Sci-Fi", "Drama", "Animation", "Comedy", "Thriller", "Crime", "Fantasy", "Mystery", "Romance", "Family", "History", "Horror", "Supernatural", "Anime", "Web Series"];
const CONTENT_TYPES = [
  { value: 'movie', label: 'Movie' },
  { value: 'anime', label: 'Anime' },
  { value: 'web-series', label: 'Web Series' }
];
const CONTENT_TYPE_LABELS = CONTENT_TYPES.reduce((labels, type) => {
  labels[type.value] = type.label;
  return labels;
}, {});

export default function AdminPanel({ onAddMovie, onDeleteMovie, onReorderMovies, existingMovies = [] }) {
  // Admin auth gate state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const saved = sessionStorage.getItem('flixtrailer_admin_authed');
    return saved === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Autofill search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Form states
  const [id, setId] = useState('');
  const [contentType, setContentType] = useState('movie');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [rating, setRating] = useState(7.0);
  const [duration, setDuration] = useState('2h 00m');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [youtubeId, setYoutubeId] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [director, setDirector] = useState('');
  const [castInput, setCastInput] = useState('');
  const [featured, setFeatured] = useState(false);

  // Edit Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState('');
  const [editSearchQuery, setEditSearchQuery] = useState('');

  // Reorder states
  const [orderedMovies, setOrderedMovies] = useState([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [reorderError, setReorderError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync ordered list with parent list on prop update
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderedMovies(existingMovies);
  }, [existingMovies]);

  // Switch between add new and edit existing movie modes
  const handleModeChange = (modeVal) => {
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (modeVal === 'new') {
      setIsEditMode(false);
      setEditingMovieId('');
      setId('');
      setContentType('movie');
      setTitle('');
      setTagline('');
      setDescription('');
      setYear(new Date().getFullYear());
      setRating(7.0);
      setDuration('2h 00m');
      setSelectedGenres([]);
      setYoutubeId('');
      setPosterUrl('');
      setBackdropUrl('');
      setDirector('');
      setCastInput('');
      setFeatured(false);
    } else {
      const movie = existingMovies.find(m => m.id === modeVal);
      if (movie) {
        setIsEditMode(true);
        setEditingMovieId(movie.id);
        setId(movie.id);
        setContentType(movie.contentType || 'movie');
        setTitle(movie.title);
        setTagline(movie.tagline || '');
        setDescription(movie.description || '');
        setYear(movie.year || new Date().getFullYear());
        setRating(movie.rating || 7.0);
        setDuration(movie.duration || '2h 00m');
        setSelectedGenres(movie.genres || []);
        setYoutubeId(movie.youtubeId || '');
        setPosterUrl(movie.posterUrl || '');
        setBackdropUrl(movie.backdropUrl || '');
        setDirector(movie.director || '');
        setCastInput(movie.cast ? movie.cast.join(', ') : '');
        setFeatured(movie.featured || false);
      }
    }
  };

  // Delete current editing movie from database
  const handleDeleteClick = async () => {
    if (!editingMovieId) return;

    const confirmDelete = window.confirm(`⚠️ WARNING: Are you sure you want to delete "${title}"? This will permanently remove it from the database.`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch(`/api/movies?id=${encodeURIComponent(editingMovieId)}`, {
        method: 'DELETE'
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        // Trigger parent state update to remove movie from UI lists
        onDeleteMovie(editingMovieId);
        
        // Reset Admin panel back to 'new' mode
        handleModeChange('new');
        setSubmitSuccess(true);
        alert(`"${title}" has been successfully deleted from the database.`);
      } else {
        setSubmitError(resData.error || 'Failed to delete the movie from the local database file.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Server connection failed. The movie was not deleted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // HTML5 Drag and Drop event handlers
  const handleDragStart = (e, idx) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow drop
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;

    setOrderedMovies(prev => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIdx, 0, draggedItem);
      return updated;
    });
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setReorderError('');
    setReorderSuccess(false);

    try {
      const response = await fetch('/api/movies/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderedMovies)
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setReorderSuccess(true);
        onReorderMovies(orderedMovies);
      } else {
        setReorderError(resData.error || 'Failed to save the new order to the database file.');
      }
    } catch (err) {
      console.error(err);
      setReorderError('Server connection failed. The movie list order was not saved.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Convert minutes string (e.g. "148 min") to "2h 28m" format
  const formatRuntime = (runtimeStr) => {
    if (!runtimeStr) return '2h 00m';
    const minutes = parseInt(runtimeStr.replace(/\D/g, ''), 10);
    if (isNaN(minutes)) return '2h 00m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  };

  // Admin login handler
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError('');
    const u = adminUsername.trim();
    if ((u === 'koushik' && adminPassword === 'koushik25') || 
        (u === 'admin' && adminPassword === 'admin123')) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('flixtrailer_admin_authed', 'true');
    } else {
      setAdminError('Invalid Admin credentials. Please check and try again.');
    }
  };

  // Auto-generate kebab-case ID from title
  const handleTitleChange = (val) => {
    setTitle(val);
    const kebab = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')          // replace spaces with hyphens
      .replace(/-+/g, '-');         // remove duplicate hyphens
    setId(kebab);
  };

  // Render Admin Authentication Gate if not logged in
  if (!isAdminAuthenticated) {
    return (
      <div className="admin-login-page animate-fade">
        <div className="admin-login-card glass">
          <div className="admin-lock-icon-wrapper">
            <Shield size={32} className="admin-lock-icon" />
          </div>
          <h2 className="admin-login-title">Admin Portal Authorization</h2>
          <p className="admin-login-desc">This section is restricted to administrators. Please log in to manage the database.</p>
          
          {adminError && (
            <div className="admin-alert error animate-fade" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Admin Username</label>
              <input 
                type="text" 
                placeholder="Enter admin username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-glow admin-login-btn" style={{ width: '100%', height: '48px', gap: '0.6rem' }}>
              <Lock size={15} />
              <span>Authorize Access</span>
            </button>
          </form>

          <div className="admin-test-credentials-box">
            <span style={{ fontWeight: 700, color: 'var(--accent-neon-blue)', fontSize: '0.78rem', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>🔑 DEMO CREDENTIALS</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              For login <strong style={{ color: 'var(--text-main)' }}> details </strong>
               contact   <strong style={{ color: 'var(--text-main)' }}>  admin</strong> <br/>
             
            </span>
          </div>
        </div>
      </div>
    );
  }


  // Query OMDb to autofill the form
  const handleAutofillSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSubmitSuccess(false);

    try {
      const url = `https://www.omdbapi.com/?t=${encodeURIComponent(searchQuery)}&apikey=trilogy`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        // Populate fields
        handleTitleChange(data.Title);
        setContentType(data.Type === 'series' ? 'web-series' : 'movie');
        setYear(parseInt(data.Year, 10) || new Date().getFullYear());
        setRating(parseFloat(data.imdbRating) || 7.0);
        setDuration(formatRuntime(data.Runtime));
        setDescription(data.Plot && data.Plot !== 'N/A' ? data.Plot : '');
        setDirector(data.Director && data.Director !== 'N/A' ? data.Director : '');
        
        // Tagline fallback
        setTagline(data.Director ? `A film by ${data.Director.split(',')[0]}.` : 'An absolute cinematic masterpiece.');
        
        // Cast input
        if (data.Actors && data.Actors !== 'N/A') {
          setCastInput(data.Actors);
        }

        // Poster
        if (data.Poster && data.Poster !== 'N/A') {
          setPosterUrl(data.Poster);
          // Set backdrop same as poster initially, or guess backdrop
          setBackdropUrl(data.Poster);
        }

        // Map genres
        if (data.Genre && data.Genre !== 'N/A') {
          const parsedGenres = data.Genre.split(',').map(g => g.trim());
          const matchedGenres = parsedGenres.filter(g => AVAILABLE_GENRES.includes(g));
          setSelectedGenres(matchedGenres);
        }

        // Clear search input on success
        setSearchQuery('');
      } else {
        setSearchError(data.Error || 'Movie not found in the OMDb database.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Network error. Failed to query the OMDb database.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle genre checkbox toggles
  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    // Validation
    if (!id.trim() || !title.trim()) {
      setSubmitError('Content ID and Title are required fields.');
      return;
    }

    if (!isEditMode && existingMovies.some(m => m.id === id)) {
      setSubmitError(`An item with ID "${id}" already exists in the database. Please specify a unique ID.`);
      return;
    }

    if (!youtubeId.trim()) {
      setSubmitError('YouTube Trailer Video ID is required.');
      return;
    }

    setIsSubmitting(true);

    const castArray = castInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const movieData = {
      id: id.trim(),
      contentType,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      year: parseInt(year, 10),
      rating: parseFloat(rating),
      duration: duration.trim(),
      genres: selectedGenres,
      youtubeId: youtubeId.trim(),
      posterUrl: posterUrl.trim(),
      backdropUrl: backdropUrl.trim() || posterUrl.trim(), // fallback to poster
      director: director.trim(),
      cast: castArray
    };

    if (featured) {
      movieData.featured = true;
    }

    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSubmitSuccess(true);
        onAddMovie(movieData);

        // Reset Form ONLY if we are creating a new movie
        if (!isEditMode) {
          setId('');
          setContentType('movie');
          setTitle('');
          setTagline('');
          setDescription('');
          setYear(new Date().getFullYear());
          setRating(7.0);
          setDuration('2h 00m');
          setSelectedGenres([]);
          setYoutubeId('');
          setPosterUrl('');
          setBackdropUrl('');
          setDirector('');
          setCastInput('');
          setFeatured(false);
        }
      } else {
        setSubmitError(resData.error || 'Failed to save the movie to the local database file.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Server connection failed. The movie was not saved to the file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEditMovies = existingMovies.filter(movie => 
    movie.title.toLowerCase().includes(editSearchQuery.toLowerCase()) || 
    movie.id.toLowerCase().includes(editSearchQuery.toLowerCase())
  );

  return (
    <div className="admin-page animate-fade">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <div>
          <h2 className="admin-title" style={{ marginBottom: '0.5rem' }}>
            <Film className="admin-title-icon" size={28} />
            <span>Trailer Library Admin Control</span>
          </h2>
          <p className="admin-subtitle">Add movies, anime, and web series trailers manually or autofill metadata from the web.</p>
        </div>
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={() => {
            setIsAdminAuthenticated(false);
            sessionStorage.removeItem('flixtrailer_admin_authed');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center', padding: '0.6rem 1.2rem', borderRadius: '10px' }}
        >
          <Lock size={15} />
          Lock Portal
        </button>
      </div>

      {/* 1. Autofill Search Section */}
      <div className="admin-section glass">
        <h3 className="section-subtitle">Web Search & Autofill</h3>
        <p className="section-desc">Search for a title to automatically query OMDb and pre-populate the metadata form below.</p>
        
        <form onSubmit={handleAutofillSearch} className="autofill-search-form">
          <div className="search-input-wrapper">
            <Search className="search-btn-icon" size={18} />
            <input 
              type="text" 
              placeholder="e.g. Gladiator II, Interstellar, Dune..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="autofill-search-input"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary autofill-search-btn"
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? 'Searching...' : 'Autofill Form'}
          </button>
        </form>

        {searchError && (
          <div className="admin-alert error animate-fade">
            <AlertCircle size={16} />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* 2. Main Form & Previews */}
      <form onSubmit={handleSubmit} className="admin-main-grid">
        {/* Form Inputs Panel */}
        <div className="form-inputs-panel glass">
          <h3 className="section-subtitle">Trailer Details Form</h3>
          <p className="section-desc" style={{ marginBottom: '1.5rem' }}>Fields marked with * are required.</p>

          {/* Edit Selection Dropdown with Search */}
          <div className="form-group" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: 'var(--accent-neon-blue)', fontWeight: 'bold' }}>Select Mode *</label>
            
            {/* Search Input for filtering options */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search existing movies by title or ID to edit..."
                value={editSearchQuery}
                onChange={(e) => setEditSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', background: 'rgba(15, 17, 28, 0.4)' }}
              />
            </div>

            <select
              className="form-input"
              value={isEditMode ? editingMovieId : 'new'}
              onChange={(e) => handleModeChange(e.target.value)}
              style={{ background: 'rgba(10, 11, 16, 0.8)', cursor: 'pointer' }}
            >
              <option value="new">🆕 Create / Add New Movie</option>
              {filteredEditMovies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  ✏️ Edit: {movie.title} ({movie.year})
                </option>
              ))}
            </select>
            {editSearchQuery && filteredEditMovies.length === 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', marginTop: '0.4rem', display: 'block' }}>
                No matching movies found in database.
              </span>
            )}
          </div>

          {submitError && (
            <div className="admin-alert error animate-fade" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="admin-alert success animate-fade" style={{ marginBottom: '1.5rem' }}>
              <Check size={18} />
              <span>{isEditMode ? 'Trailer successfully updated and saved to the database on disk!' : 'Trailer successfully added and saved to the database on disk!'}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Content Type *</label>
            <select
              className="form-input"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              required
              style={{ background: 'rgba(10, 11, 16, 0.8)', cursor: 'pointer' }}
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            {/* Title */}
            <div className="form-group flex-2">
              <label className="form-label">Title *</label>
              <input 
                type="text"
                placeholder="e.g. Inception"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="form-input"
                required
              />
            </div>
            {/* ID */}
            <div className="form-group flex-1">
              <label className="form-label">Movie ID (Slug) *</label>
              <input 
                type="text"
                placeholder="e.g. inception"
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="form-input"
                required
                disabled={isEditMode}
                style={{ 
                  opacity: isEditMode ? 0.65 : 1, 
                  cursor: isEditMode ? 'not-allowed' : 'text',
                  backgroundColor: isEditMode ? 'rgba(255, 255, 255, 0.02)' : ''
                }}
                title={isEditMode ? "ID cannot be changed during editing" : ""}
              />
              {isEditMode && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  ID is locked in edit mode.
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            {/* Tagline */}
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input 
                type="text"
                placeholder="e.g. Your mind is the scene of the crime."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Plot Summary</label>
            <textarea 
              placeholder="Provide a brief plot summary of the movie..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          <div className="form-row">
            {/* Year */}
            <div className="form-group">
              <label className="form-label">Release Year</label>
              <input 
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="form-input"
              />
            </div>
            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating (Out of 10)</label>
              <input 
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            {/* Duration */}
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input 
                type="text"
                placeholder="e.g. 2h 28m"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Genres Checklist */}
          <div className="form-group">
            <label className="form-label">Genres (Select all that apply)</label>
            <div className="genres-checkbox-grid">
              {AVAILABLE_GENRES.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={`genre-checkbox-pill ${selectedGenres.includes(genre) ? 'active' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {selectedGenres.includes(genre) && <Check size={12} />}
                  <span>{genre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            {/* Director */}
            <div className="form-group">
              <label className="form-label">Director</label>
              <input 
                type="text"
                placeholder="e.g. Christopher Nolan"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Cast */}
          <div className="form-group">
            <label className="form-label">Cast Members (Comma-separated)</label>
            <input 
              type="text"
              placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page"
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              className="form-input"
            />
          </div>

          {/* YouTube ID */}
          <div className="form-group">
            <label className="form-label">YouTube Trailer Video ID *</label>
            <div className="form-input-addon-wrapper">
              <span className="form-input-addon">youtube.com/watch?v=</span>
              <input 
                type="text"
                placeholder="YoHD9OB-K8A"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                className="form-input"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                required
              />
            </div>
          </div>

          {/* Image URLs */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Poster Image URL</label>
              <input 
                type="url"
                placeholder="https://example.com/poster.jpg"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Backdrop Landscape URL</label>
              <input 
                type="url"
                placeholder="https://example.com/backdrop.jpg"
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Featured Toggle Switch */}
          <div className="form-group featured-toggle-group">
            <div className="featured-toggle-desc">
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Featured Trailer</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>If enabled, this movie will be highlighted in the large hero banner at the top of the homepage.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={featured} 
                onChange={(e) => setFeatured(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {isEditMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                style={{ 
                  flex: '1', 
                  minWidth: '150px', 
                  borderColor: 'rgba(239, 68, 68, 0.4)', 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  height: '52px'
                }}
              >
                <Trash2 size={18} />
                Delete Movie
              </button>
            )}
            
            <button 
              type="submit" 
              className="btn btn-glow submit-form-btn"
              disabled={isSubmitting}
              style={{ flex: '2', minWidth: '200px', height: '52px' }}
            >
              {isSubmitting ? (
                isEditMode ? 'Updating Movie...' : 'Saving Movie...'
              ) : (
                <>
                  {isEditMode ? <Check size={18} /> : <Plus size={18} />}
                  {isEditMode ? 'Update Movie' : 'Save Movie to Database'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Previews Panel */}
        <div className="form-previews-panel">
          {/* Card Preview */}
          <div className="preview-card-section glass">
            <h4 className="preview-title">Live Grid Card Preview</h4>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div className="movie-card" style={{ cursor: 'default' }}>
                <div className="movie-card-img-wrapper" style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                  {posterUrl ? (
                    <img src={posterUrl} alt="Poster" className="movie-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="preview-placeholder">
                      <Image size={40} className="preview-placeholder-icon" />
                      <span>Poster Image</span>
                    </div>
                  )}
                </div>
                <div className="movie-card-overlay-preview" style={{ padding: '1rem', background: 'rgba(15, 17, 28, 0.95)' }}>
                  <span className={`movie-card-type-badge type-${contentType}`} style={{ position: 'static', display: 'inline-flex', width: 'fit-content', marginBottom: '0.6rem' }}>
                    {CONTENT_TYPE_LABELS[contentType] || 'Trailer'}
                  </span>
                  <h3 className="movie-card-title">{title || "Movie Title"}</h3>
                  <div className="movie-card-genres" style={{ marginTop: '0.4rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {selectedGenres.length > 0 ? (
                      selectedGenres.slice(0, 2).map(g => (
                        <span key={g} className="movie-card-genre-tag">{g}</span>
                      ))
                    ) : (
                      <span className="movie-card-genre-tag">Genres</span>
                    )}
                  </div>
                  <div className="movie-card-meta" style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>⭐ {rating || "0.0"}</span>
                    <span>{year || "Year"}</span>
                    <span>{duration || "Duration"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Trailer Preview */}
          <div className="preview-card-section glass" style={{ marginTop: '2rem' }}>
            <h4 className="preview-title">YouTube Trailer Live Embed</h4>
            <div className="youtube-preview-container" style={{ marginTop: '1rem' }}>
              {youtubeId ? (
                <div className="youtube-iframe-wrapper">
                  <iframe 
                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="preview-placeholder youtube">
                  <Video size={40} className="preview-placeholder-icon" />
                  <span>Enter a YouTube ID to preview the trailer</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* 3. Reorder Movies Section */}
      <div className="admin-section glass" style={{ marginTop: '3rem' }}>
        <h3 className="section-subtitle">Change Default Movie Order</h3>
        <p className="section-desc">Drag and drop any movie row by clicking and holding to rearrange their default sequence on the homepage. Click "Save Order" when finished.</p>
        
        {reorderSuccess && (
          <div className="admin-alert success animate-fade" style={{ marginBottom: '1.5rem' }}>
            <Check size={18} />
            <span>Movie list order updated successfully and saved to disk!</span>
          </div>
        )}

        {reorderError && (
          <div className="admin-alert error animate-fade" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{reorderError}</span>
          </div>
        )}

        <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(10, 11, 16, 0.4)', padding: '0.5rem' }}>
          {orderedMovies.map((movie, idx) => (
            <div 
              key={movie.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.85rem 1rem', 
                borderBottom: idx === orderedMovies.length - 1 ? 'none' : '1px solid var(--border-color)',
                gap: '1rem',
                cursor: 'grab',
                opacity: draggedIndex === idx ? 0.4 : 1,
                background: draggedIndex === idx ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                transition: 'all 0.15s ease',
                borderRadius: '8px',
                marginBottom: '0.25rem',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (draggedIndex !== idx) {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (draggedIndex !== idx) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GripVertical size={16} style={{ color: 'var(--text-dim)', cursor: 'grab' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', width: '24px', fontWeight: 600 }}>{idx + 1}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>{movie.title}</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-neon-blue)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  {CONTENT_TYPE_LABELS[movie.contentType || 'movie'] || 'Trailer'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>({movie.year})</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {movie.featured && (
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                    Featured
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--star-color)', fontWeight: 600 }}>
                  ⭐ {movie.rating}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-glow"
          onClick={handleSaveOrder}
          disabled={isSavingOrder || orderedMovies.length === 0}
          style={{ marginTop: '1.5rem', width: '100%', height: '48px', gap: '0.5rem' }}
        >
          {isSavingOrder ? 'Saving Order...' : '💾 Save New Movie Order'}
        </button>
      </div>
    </div>
  );
}
