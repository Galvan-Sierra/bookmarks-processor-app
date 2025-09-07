import { readdir } from 'node:fs/promises';

export async function readDirectory(path: string): Promise<string[]> {
  const normalizePath = path.replaceAll('/', '\\');

  const files = await readdir(normalizePath, { recursive: true });
  return files.map((file) => normalizePath + file);
}
