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
}
