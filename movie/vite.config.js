import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const moviesDataPath = path.resolve(__dirname, 'public/api/movies.json')

const readMoviesData = () => {
  if (!fs.existsSync(moviesDataPath)) {
    return []
  }

  return JSON.parse(fs.readFileSync(moviesDataPath, 'utf-8'))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'movies-api-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const urlObj = new URL(req.url, 'http://localhost');
          
          if ((req.method === 'GET' || req.method === 'HEAD') && (urlObj.pathname === '/api/movies' || urlObj.pathname === '/api/movies.json')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(readMoviesData()));
            return;
          }

          if (req.method === 'POST' && urlObj.pathname === '/api/movies') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const newMovie = JSON.parse(body);
                // Ensure id exists
                if (!newMovie.id || !newMovie.title) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Movie ID and Title are required' }));
                  return;
                }
                const moviesPath = path.resolve(__dirname, 'public/api/movies.json');
                let movies = [];
                if (fs.existsSync(moviesPath)) {
                  movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));
                }
                
                // Check if movie already exists to update it in-place
                const existingIndex = movies.findIndex(m => m.id === newMovie.id);
                if (existingIndex > -1) {
                  movies[existingIndex] = { ...movies[existingIndex], ...newMovie };
                } else {
                  if (newMovie.featured) {
                    movies.unshift(newMovie);
                  } else {
                    movies.push(newMovie);
                  }
                }

                fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2), 'utf-8');
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, movie: newMovie }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else if (req.method === 'DELETE' && urlObj.pathname === '/api/movies') {
            try {
              const idToDelete = urlObj.searchParams.get('id');
              if (!idToDelete) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Movie ID is required for deletion' }));
                return;
              }
              const moviesPath = path.resolve(__dirname, 'public/api/movies.json');
              let movies = [];
              if (fs.existsSync(moviesPath)) {
                movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));
              }
              const exists = movies.some(m => m.id === idToDelete);
              if (!exists) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `Movie with ID "${idToDelete}" not found in database.` }));
                return;
              }
              const updatedMovies = movies.filter(m => m.id !== idToDelete);
              fs.writeFileSync(moviesPath, JSON.stringify(updatedMovies, null, 2), 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Movie deleted successfully' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          } else if (req.method === 'POST' && urlObj.pathname === '/api/movies/reorder') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const reorderedMovies = JSON.parse(body);
                if (!Array.isArray(reorderedMovies)) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Body must be an array of movies' }));
                  return;
                }
                const moviesPath = path.resolve(__dirname, 'public/api/movies.json');
                fs.writeFileSync(moviesPath, JSON.stringify(reorderedMovies, null, 2), 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
