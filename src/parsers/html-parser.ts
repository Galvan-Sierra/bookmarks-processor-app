import { HTML_TEMPLATE } from '@config/constants';
import type { Bookmark, FolderNode } from '@type/bookmark';

export class HtmlParser {
  parse(content: string): Bookmark[] {
    const bookmarks: Bookmark[] = [];

    const lines = content.split('\n');
    const folderStack: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detectar carpetas
      const folderMatch = line.match(/<H3[^>]*>([^<]+)<\/H3>/i);
      if (folderMatch) {
        const folderName = folderMatch[1].trim();

        // Ignorar la carpeta "Marcadores" ya que es solo el contenedor principal
        if (folderName === 'Marcadores') {
          continue;
        }

        folderStack.push(folderName);
        continue;
      }

      // Detectar fin de carpeta
      if (line.includes('</DL>')) {
        if (folderStack.length > 0) {
          folderStack.pop();
        }
        continue;
      }

      // Detectar bookmarks - patrón más flexible para capturar todos los atributos
      const bookmarkMatch = line.match(/<A\s+([^>]+)>([^<]+)<\/A>/i);
      if (bookmarkMatch) {
        const [, attributes, title] = bookmarkMatch;

        // Extraer URL
        const hrefMatch = attributes.match(/HREF="([^"]+)"/i);
        if (!hrefMatch) continue;

        const href = hrefMatch[1].trim();

        // Extraer ícono
        const iconMatch = attributes.match(/ICON="([^"]+)"/i);
        const icon = iconMatch ? iconMatch[1].trim() : undefined;

        // Construir la ruta de la carpeta
        const folder =
          folderStack.length > 0 ? folderStack.join(' > ') : 'Marcadores';

        // Extraer fecha de adición si existe
        const addDateMatch = attributes.match(/ADD_DATE="([^"]+)"/i);
        const addDate = addDateMatch ? parseInt(addDateMatch[1]) : 0;

        bookmarks.push({
          title: title.trim(),
          href,
          folder,
          icon,
          addDate,
        });
      }
    }

    return bookmarks;
  }

  serialize(bookmarks: Bookmark[]): string {
    // Estructura básica del archivo HTML de bookmarks
    let html = HTML_TEMPLATE;
    // Construir el árbol de carpetas
    const folderTree = this.buildFolderTree(bookmarks);

    // Renderizar el árbol completo
    html += this.renderFolderTreeToHtml(folderTree, 2);

    // Cerrar estructura
    html += `    </DL><p>
</DL><p>
`;

    return html;
  }

  private buildFolderTree(bookmarks: Bookmark[]): FolderNode {
    const root: FolderNode = {
      name: 'Marcadores',
      bookmarks: [],
      children: new Map(),
    };

    bookmarks.forEach((bookmark) => {
      const folderPath = bookmark.folder || 'Marcadores';

      if (folderPath === 'Marcadores') {
        root.bookmarks.push(bookmark);
        return;
      }

      const parts = folderPath.split(' > ');
      let currentNode = root;

      // Navegar/crear la estructura de carpetas
      for (const part of parts) {
        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            name: part,
            bookmarks: [],
            children: new Map(),
            parent: currentNode,
          });
        }
        currentNode = currentNode.children.get(part)!;
      }

      // Agregar el bookmark al nodo final
      currentNode.bookmarks.push(bookmark);
    });

    return root;
  }

  private renderFolderTreeToHtml(
    node: FolderNode,
    indentLevel: number
  ): string {
    const indent = '    '.repeat(indentLevel);
    let html = '';

    // Renderizar bookmarks del nodo actual
    node.bookmarks.forEach((bookmark) => {
      html += this.formatBookmarkHtml(bookmark, indentLevel);
    });

    // Renderizar carpetas hijas
    const sortedChildren = Array.from(node.children.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    );

    sortedChildren.forEach(([folderName, childNode]) => {
      // Abrir carpeta
      html += `${indent}<DT><H3>${folderName}</H3>\n`;
      html += `${indent}<DL><p>\n`;

      // Renderizar contenido de la carpeta recursivamente
      html += this.renderFolderTreeToHtml(childNode, indentLevel + 1);

      // Cerrar carpeta
      html += `${indent}</DL><p>\n`;
    });

    return html;
  }

  private formatBookmarkHtml(bookmark: Bookmark, indentLevel: number): string {
    const indent = '    '.repeat(indentLevel);
    let attributes = `HREF="${bookmark.href}"`;

    // Agregar ícono si existe
    if (bookmark.icon) {
      attributes += ` ICON="${bookmark.icon}"`;
    }

    // Agregar fecha de adición si existe
    if (bookmark.addDate) {
      const timestamp = bookmark.addDate;
      attributes += ` ADD_DATE="${timestamp}"`;
    }

    return `${indent}<DT><A ${attributes}>${bookmark.title}</A>\n`;
  }
}
