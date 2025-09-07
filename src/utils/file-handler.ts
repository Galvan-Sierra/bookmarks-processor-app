import { rm } from 'node:fs/promises';

export class FileHandler {
  async readFile(filePath: string): Promise<string> {
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    try {
      return await file.text();
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  async writeFile(filePath: string, fileContent: string): Promise<void> {
    try {
      await Bun.write(filePath, fileContent);
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await rm(filePath, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }
}
