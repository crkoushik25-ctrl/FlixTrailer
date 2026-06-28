import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Heart, Clock, Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const contentTypeLabels = {
  movie: 'Movie',
  anime: 'Anime',
  'web-series': 'Web Series'
};

export default function Hero({ 
  movies = [], 
  onPlay, 
  favourites = [], 
  watchLater = [], 
  onToggleFavourite, 
  onToggleWatchLater 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  
  // Drag / Swipe gesture states
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const timerRef = useRef(null);

  const slideCount = movies.length;

  const handleNext = useCallback(() => {
    if (slideCount === 0) return;
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    if (slideCount === 0) return;
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-play interval effect
  useEffect(() => {
    if (slideCount <= 1 || autoplayPaused || isDragging) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 7000); // Rotate slides every 7 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, autoplayPaused, handleNext, isDragging, slideCount]);

  // Drag Gesture Handlers
  const handleDragStart = (clientX, e) => {
    if (e && e.type === 'mousedown') {
      e.preventDefault(); // Prevents image/text selection dragging
    }
    setDragStartX(clientX);
    setDragCurrentX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging) return;
    setDragCurrentX(clientX);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = dragStartX - dragCurrentX;
    const swipeThreshold = 60; // minimum 60px swipe required

    if (deltaX > swipeThreshold) {
      handleNext();
    } else if (deltaX < -swipeThreshold) {
      handlePrev();
    }
  }, [dragCurrentX, dragStartX, handleNext, handlePrev, isDragging]);

  // Attach global mouse move/up listeners when dragging is active
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      handleDragMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleDragEnd, handleDragMove, isDragging]);

  if (!movies || movies.length === 0) return null;

  return (
    <div 
      className="hero-banner"
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={() => setAutoplayPaused(false)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX, e)}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Slider Slides Wrapper */}
      <div 
        className="hero-slides-wrapper"
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          transform: `translateX(calc(-${activeIndex * 100}% - ${isDragging ? (dragStartX - dragCurrentX) : 0}px))`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {movies.map((movie) => {
          const isFavourite = favourites.includes(movie.id);
          const isWatchLater = watchLater.includes(movie.id);
          const contentLabel = contentTypeLabels[movie.contentType || 'movie'] || 'Trailer';

          return (
            <div key={movie.id} className="hero-slide">
              {/* Background Poster Image */}
              <div 
                className="hero-backdrop" 
                style={{ backgroundImage: `url(${movie.backdropUrl})` }}
              />
              {/* Dark overlay gradients */}
              <div className="hero-overlay" />

              {/* Main Details */}
              <div className="hero-content">
                <div className="hero-tag">
                  <FlameIcon size={12} fill="currentColor" />
                  Featured {contentLabel}
                </div>
                <h1 className="hero-title">{movie.title}</h1>
                
                <div className="hero-meta">
                  <div className="hero-meta-item">
                    <Star className="hero-rating" size={16} fill="currentColor" />
                    <span className="hero-rating">{movie.rating}</span>
                  </div>
                  <span>|</span>
                  <div className="hero-meta-item">
                    <span>{movie.year}</span>
                  </div>
                  <span>|</span>
                  <div className="hero-meta-item">
                    <Clock size={15} />
                    <span>{movie.duration}</span>
                  </div>
                  <span>|</span>
                  <div className="hero-meta-item">
                    <span style={{ color: 'var(--accent-neon-blue)', fontWeight: 600 }}>
                      {movie.genres.slice(0, 2).join(' / ')}
                    </span>
                  </div>
                </div>

                <p className="hero-desc">{movie.description}</p>

                {/* Prevent dragging actions button from triggering drag */}
                <div className="hero-actions" onMouseDown={(e) => e.stopPropagation()}>
                  {/* Play Button */}
                  <button className="btn btn-glow" onClick={() => onPlay(movie)}>
                    <Play size={18} fill="currentColor" />
                    Play Trailer
                  </button>

                  {/* Toggle Favourite Button */}
                  <button 
                    className={`btn btn-secondary ${isFavourite ? 'active' : ''}`}
                    onClick={() => onToggleFavourite(movie.id)}
                    style={{ 
                      borderColor: isFavourite ? 'var(--accent-secondary)' : '',
                      color: isFavourite ? 'var(--accent-secondary)' : ''
                    }}
                  >
                    <Heart size={18} fill={isFavourite ? "currentColor" : "none"} />
                    {isFavourite ? 'Favourited' : 'Add to Favourite'}
                  </button>

                  {/* Toggle Watch Later Button */}
                  <button 
                    className={`btn btn-secondary ${isWatchLater ? 'active' : ''}`}
                    onClick={() => onToggleWatchLater(movie.id)}
                    style={{ 
                      borderColor: isWatchLater ? 'var(--accent-neon-blue)' : '',
                      color: isWatchLater ? 'var(--accent-neon-blue)' : ''
                    }}
                  >
                    {isWatchLater ? <Check size={18} /> : <Clock size={18} />}
                    {isWatchLater ? 'Watch Later Saved' : 'Watch Later'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Arrow Controls */}
      {slideCount > 1 && (
        <>
          <button 
            type="button" 
            className="hero-arrow prev" 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            title="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            type="button" 
            className="hero-arrow next" 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            title="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicator Dot Controls */}
          <div className="hero-dots" onMouseDown={(e) => e.stopPropagation()}>
            {movies.map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`hero-dot ${activeIndex === idx ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Simple internal icon helper for the featured tag
function FlameIcon({ size, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
