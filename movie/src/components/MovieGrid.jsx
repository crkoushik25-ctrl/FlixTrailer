import MovieCard from './MovieCard';
import { Film } from 'lucide-react';

export default function MovieGrid({ 
  movies = [], 
  title, 
  onPlay, 
  favourites = [], 
  watchLater = [], 
  onToggleFavourite, 
  onToggleWatchLater,
  emptyIcon: EmptyIcon = Film,
  emptyTitle = "No trailers found",
  emptyDesc = "Try searching for another keyword or select a different category.",
  emptyActionText,
  onEmptyAction,
  showSort = false,
  sortBy = 'default',
  onSortChange
}) {
  return (
    <section className="animate-fade" style={{ marginTop: '2rem' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0, flex: 1 }}>{title}</h2>
          
          {showSort && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 5 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '0.4rem 1.8rem 0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'var(--transition-smooth)',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="default" style={{ background: 'var(--bg-secondary)' }}>Trending (Default)</option>
                <option value="rating" style={{ background: 'var(--bg-secondary)' }}>Rating (Highest First)</option>
                <option value="year-desc" style={{ background: 'var(--bg-secondary)' }}>Newest First</option>
                <option value="year-asc" style={{ background: 'var(--bg-secondary)' }}>Oldest First</option>
                <option value="title-asc" style={{ background: 'var(--bg-secondary)' }}>Title: A to Z</option>
                <option value="title-desc" style={{ background: 'var(--bg-secondary)' }}>Title: Z to A</option>
              </select>
            </div>
          )}
        </div>
      )}

      {movies.length > 0 ? (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              isFavourite={favourites.includes(movie.id)}
              isWatchLater={watchLater.includes(movie.id)}
              onToggleFavourite={onToggleFavourite}
              onToggleWatchLater={onToggleWatchLater}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <EmptyIcon className="empty-icon" size={60} />
          <h3 className="empty-title">{emptyTitle}</h3>
          <p className="empty-desc">{emptyDesc}</p>
          {emptyActionText && onEmptyAction && (
            <button className="btn btn-primary" onClick={onEmptyAction}>
              {emptyActionText}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
