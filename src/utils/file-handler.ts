export class FileHandler {
  async read(path: string): Promise<string> {
    try {
      const content = await Bun.file(path).text();
      return content;
    } catch (error) {
      console.error(`⚠ Error al leer el archivo ${path}`);
      throw new Error(`No se pudo cargar el archivo: ${error}`);
    }
  }

  async write(path: string, data: string): Promise<void> {
    try {
      await Bun.write(path, data);
    } catch (error) {
      console.error(`⚠ Error al guardar el archivo  '${path}'`);
      throw new Error(`No se pudo guardar el archivo de marcadores: ${error}`);
    }
  }
}
