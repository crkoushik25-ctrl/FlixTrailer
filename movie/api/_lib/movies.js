import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moviesFilePath = path.resolve(__dirname, '..', '..', 'public', 'api', 'movies.json');

export async function readMovies() {
  await fs.mkdir(path.dirname(moviesFilePath), { recursive: true });

  const fileContent = await fs.readFile(moviesFilePath, 'utf8').catch(() => null);
  if (!fileContent) {
    return [];
  }

  const parsed = JSON.parse(fileContent);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeMovies(movies) {
  await fs.mkdir(path.dirname(moviesFilePath), { recursive: true });
  await fs.writeFile(moviesFilePath, JSON.stringify(movies, null, 2), 'utf8');
  return movies;
}

export function getRequestQuery(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  return Object.fromEntries(url.searchParams.entries());
}

export function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined) {
      resolve(req.body);
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}
