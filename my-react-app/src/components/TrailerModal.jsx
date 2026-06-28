import { useEffect } from 'react';
import { X, Heart, Clock, Star, Check } from 'lucide-react';

const contentTypeLabels = {
  movie: 'Movie',
  anime: 'Anime',
  'web-series': 'Web Series'
};

export default function TrailerModal({ 
  movie, 
  onClose, 
  isFavourite, 
  isWatchLater, 
  onToggleFavourite, 
  onToggleWatchLater 
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!movie) return null;
  const contentLabel = contentTypeLabels[movie.contentType || 'movie'] || 'Trailer';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} title="Close Player">
          <X size={20} />
        </button>

        {/* Responsive Video Container */}
        <div className="video-wrapper">
          <iframe 
            src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&rel=0`}
            title={`${movie.title} Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Info & Details Section */}
        <div className="modal-details">
          <div className="modal-header-section">
            <div className="modal-title-desc">
              <span className="modal-tagline">{movie.tagline}</span>
              <h2 className="modal-title">{movie.title}</h2>
              
              <div className="modal-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--star-color)' }}>
                  <Star size={16} fill="currentColor" />
                  <strong>{movie.rating}</strong>
                </span>
                <span>|</span>
                <span>{contentLabel}</span>
                <span>|</span>
                <span>{movie.year}</span>
                <span>|</span>
                <span>{movie.duration}</span>
              </div>
            </div>

            {/* Quick Actions inside Details Panel */}
            <div className="modal-actions">
              <button 
                className={`icon-btn ${isFavourite ? 'active' : ''}`}
                onClick={() => onToggleFavourite(movie.id)}
                title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
              >
                <Heart size={18} fill={isFavourite ? "currentColor" : "none"} />
              </button>
              
              <button 
                className={`icon-btn ${isWatchLater ? 'active' : ''}`}
                onClick={() => onToggleWatchLater(movie.id)}
                style={{ 
                  backgroundColor: isWatchLater ? 'var(--accent-neon-blue)' : '',
                  borderColor: isWatchLater ? 'var(--accent-neon-blue)' : '' 
                }}
                title={isWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
              >
                {isWatchLater ? <Check size={18} /> : <Clock size={18} />}
              </button>
            </div>
          </div>

          <div className="modal-info-grid">
            {/* Synopsis Column */}
            <div>
              <h4 className="modal-synopsis-title">Synopsis</h4>
              <p className="modal-synopsis">{movie.description}</p>
            </div>

            {/* Crew/Cast Credits Column */}
            <div className="modal-credits">
              <div className="modal-credit-item">
                <span className="modal-credit-label">Director</span>
                <strong>{movie.director}</strong>
              </div>
              <div className="modal-credit-item">
                <span className="modal-credit-label">Cast</span>
                <strong>{movie.cast.join(', ')}</strong>
              </div>
              <div className="modal-credit-item">
                <span className="modal-credit-label">Genres</span>
                <span style={{ color: 'var(--accent-neon-blue)', fontWeight: 600 }}>
                  {movie.genres.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
