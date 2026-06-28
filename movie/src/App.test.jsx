import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock movie data for rendering tests
const mockMovies = [
  {
    id: "dune-2",
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge.",
    year: 2024,
    rating: 8.6,
    duration: "2h 46m",
    genres: ["Sci-Fi", "Adventure", "Action"],
    youtubeId: "Way9Dexny3w",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfxoiRL3z43vESCOqhVfb5Z3g.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PqaHD696zdCj6u5IMB.jpg",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya"],
    featured: true
  },
  {
    id: "rrr",
    title: "RRR",
    tagline: "Rise, Roar, Revolt.",
    description: "A fictional history of two legendary revolutionaries.",
    year: 2022,
    rating: 7.8,
    duration: "3h 07m",
    genres: ["Action", "Drama"],
    youtubeId: "GY4BgdUSpbE",
    posterUrl: "https://image.tmdb.org/t/p/w500/u612n6W3jmdg5EsYHG4n6vB0mJ9.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/70C4jJZ7XMrqQV03vVg52U6OmEz.jpg",
    director: "S. S. Rajamouli",
    cast: ["Ram Charan", "N. T. Rama Rao Jr."]
  }
];

describe('FlixTrailer DOM Testing', () => {
  beforeEach(() => {
    // Reset global fetch mock
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMovies),
      })
    ));
    // Clear localStorage
    localStorage.clear();
  });

  it('renders loading spinner initially on DOM mount', async () => {
    render(<App />);
    expect(screen.getByText(/Loading FlixTrailer Database.../i)).toBeInTheDocument();
  });

  it('renders Header, Hero and Movie Cards after movie API data loads', async () => {
    render(<App />);

    // Wait for the mock API response to resolve and render components
    await waitFor(() => {
      expect(screen.getAllByText("FlixTrailer")[0]).toBeInTheDocument();
    });

    // Check header search input
    expect(screen.getByPlaceholderText(/Search movies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anime/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Web Series/i })).toBeInTheDocument();

    // Check Hero Banner elements (Dune: Part Two is the featured movie)
    expect(screen.getAllByText("Dune: Part Two")[0]).toBeInTheDocument();
    expect(screen.getByText(/Paul Atreides unites with Chani/i)).toBeInTheDocument();

    // Check Movies grid items
    expect(screen.getByText("Trending Movie, Anime & Web Series Trailers")).toBeInTheDocument();
    
    // Check that card titles are rendered
    expect(screen.getByText("RRR")).toBeInTheDocument();
  });

  it('navigates to Favourites page and displays custom empty state when list is empty', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("FlixTrailer")[0]).toBeInTheDocument();
    });

    // Click on Favourites navigation tab
    const favTab = screen.getAllByText("Favourites")[0];
    fireEvent.click(favTab);

    // Verify page updates
    expect(screen.getByText("My Favourite Trailers")).toBeInTheDocument();
    expect(screen.getByText("Your Favourites is Empty")).toBeInTheDocument();
  });

  it('navigates to Watch Later page and displays custom empty state when list is empty', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("FlixTrailer")[0]).toBeInTheDocument();
    });

    // Click on Watch Later navigation tab
    const watchLaterTab = screen.getAllByText("Watch Later")[0];
    fireEvent.click(watchLaterTab);

    // Verify page updates
    expect(screen.getByText("Watch Later Queue")).toBeInTheDocument();
    expect(screen.getByText("Watch Later Queue is Empty")).toBeInTheDocument();
  });

  it('filters movies based on search keyword inputs', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("FlixTrailer")[0]).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search movies/i);
    
    // Search for RRR
    fireEvent.change(searchInput, { target: { value: 'RRR' } });

    // The hero banner should disappear during active search
    expect(screen.queryByText("Long live the fighters.")).not.toBeInTheDocument();

    // The grid should filter to RRR and hide Dune
    expect(screen.getByText("Search Results for \"RRR\"")).toBeInTheDocument();
    expect(screen.getByText("RRR")).toBeInTheDocument();
    expect(screen.queryByText("Dune: Part Two")).not.toBeInTheDocument();
  });

  it('opens Login Card on clicking Sign In and displays credentials forms', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("FlixTrailer")[0]).toBeInTheDocument();
    });

    // Click sign in button in header
    const signInBtn = screen.getByText("Sign In");
    fireEvent.click(signInBtn);

    // Verify form renders
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });
});
