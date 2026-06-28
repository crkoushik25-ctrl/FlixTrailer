import { parseRequestBody, writeMovies } from '../_lib/movies.js';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const reorderedMovies = await parseRequestBody(req);
    if (!Array.isArray(reorderedMovies)) {
      return sendJson(res, 400, { error: 'Body must be an array of movies' });
    }

    await writeMovies(reorderedMovies);
    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}
