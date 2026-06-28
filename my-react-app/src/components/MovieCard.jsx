import { Play, Heart, Clock, Star } from 'lucide-react';

const contentTypeLabels = {
  movie: 'Movie',
  anime: 'Anime',
  'web-series': 'Web Series'
};

const escapeSvgText = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const getPosterFallback = (movie, contentLabel) => {
  const title = escapeSvgText((movie.title || 'Trailer').slice(0, 34));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#121420"/>
          <stop offset="0.55" stop-color="#1d2b43"/>
          <stop offset="1" stop-color="#3b1d4f"/>
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#g)"/>
      <rect x="44" y="58" width="512" height="784" rx="24" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
      <text x="52" y="112" fill="#67e8f9" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="3">${contentLabel.toUpperCase()}</text>
      <text x="52" y="472" fill="#f8fafc" font-family="Arial, sans-serif" font-size="54" font-weight="800">${title}</text>
      <text x="52" y="536" fill="#94a3b8" font-family="Arial, sans-serif" font-size="28">Trailer poster</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default function MovieCard({ 
  movie, 
  onPlay, 
  isFavourite, 
  isWatchLater, 
  onToggleFavourite, 
  onToggleWatchLater 
}) {
  const contentType = movie.contentType || 'movie';
  const contentLabel = contentTypeLabels[contentType] || 'Trailer';

  return (
    <div className="movie-card animate-scale" onClick={() => onPlay(movie)}>
      {/* Poster Image */}
      <img 
        src={movie.posterUrl} 
        alt={movie.title} 
        className="movie-card-img" 
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getPosterFallback(movie, contentLabel);
        }}
      />

      <span className={`movie-card-type-badge type-${contentType}`}>
        {contentLabel}
      </span>

      {/* Action Buttons Top Right (Absolute Overlaid) */}
      <div className="movie-card-actions" onClick={(e) => e.stopPropagation()}>
        {/* Favourite Button */}
        <button 
          className={`icon-btn ${isFavourite ? 'active' : ''}`}
          onClick={() => onToggleFavourite(movie.id)}
          title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
        >
          <Heart size={16} fill={isFavourite ? "currentColor" : "none"} />
        </button>

        {/* Watch Later Button */}
        <button 
          className={`icon-btn ${isWatchLater ? 'active' : ''}`}
          onClick={() => onToggleWatchLater(movie.id)}
          style={{ 
            backgroundColor: isWatchLater ? 'var(--accent-neon-blue)' : '',
            borderColor: isWatchLater ? 'var(--accent-neon-blue)' : '' 
          }}
          title={isWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
        >
          <Clock size={16} />
        </button>
      </div>

      {/* Hover Overlay Details */}
      <div className="movie-card-overlay">
        {/* Play Icon in center */}
        <div className="movie-card-play-btn">
          <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
        </div>

        {/* Title */}
        <h3 className="movie-card-title">{movie.title}</h3>

        {/* Genres */}
        <div className="movie-card-genres">
          {movie.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="movie-card-genre-tag">
              {genre}
            </span>
          ))}
        </div>

        {/* Metadata info */}
        <div className="movie-card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Star size={14} fill="currentColor" style={{ color: 'var(--star-color)' }} />
            <strong style={{ color: 'white' }}>{movie.rating}</strong>
          </span>
          <span>{movie.year}</span>
          <span>{movie.duration}</span>
        </div>
      </div>
    </div>
  );
}
