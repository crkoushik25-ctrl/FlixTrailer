import { getRequestQuery, parseRequestBody, readMovies, writeMovies } from './_lib/movies.js';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const movies = await readMovies();
    return sendJson(res, 200, movies);
  }

  if (req.method === 'POST') {
    try {
      const newMovie = await parseRequestBody(req);
      if (!newMovie || !newMovie.id || !newMovie.title) {
        return sendJson(res, 400, { error: 'Movie ID and Title are required' });
      }

      const movies = await readMovies();
      const existingIndex = movies.findIndex((movie) => movie.id === newMovie.id);

      if (existingIndex > -1) {
        movies[existingIndex] = { ...movies[existingIndex], ...newMovie };
      } else if (newMovie.featured) {
        movies.unshift(newMovie);
      } else {
        movies.push(newMovie);
      }

      await writeMovies(movies);
      return sendJson(res, 201, { success: true, movie: newMovie });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const idToDelete = getRequestQuery(req).id;

    if (!idToDelete) {
      return sendJson(res, 400, { error: 'Movie ID is required for deletion' });
    }

    try {
      const movies = await readMovies();
      const exists = movies.some((movie) => movie.id === idToDelete);
      if (!exists) {
        return sendJson(res, 404, { error: `Movie with ID "${idToDelete}" not found in database.` });
      }

      const updatedMovies = movies.filter((movie) => movie.id !== idToDelete);
      await writeMovies(updatedMovies);
      return sendJson(res, 200, { success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}
