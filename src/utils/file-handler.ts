export class FileHandler {
  async read(path: string): Promise<string> {
    const file = Bun.file(path);

    if (!(await file.exists())) {
      throw new Error(`El archivo ${path} no existe`);
    }

    try {
      const content = await file.text();
      return content;
    } catch (error) {
      throw new Error(
        `No se pudo leer el archivo: ${path}. ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }

  async write(path: string, data: string): Promise<void> {
    try {
      await Bun.write(path, data);
    } catch (error) {
      throw new Error(
        `No se pudo guardar el archivo: ${path}}. ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }
}
