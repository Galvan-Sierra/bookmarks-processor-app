export class DOMHelper {
  static querySelector(
    selector: string,
    parent: Element | Document = document
  ): Element | null {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  static querySelectorAll(
    selector: string,
    parent: Element
  ): NodeListOf<Element> {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      throw error;
    }
  }

  static extractCompleteText(element: Element, selector: string): string {
    const targetElement = DOMHelper.querySelector(selector, element);
    if (!targetElement) return '';

    return this.extractTextFromNode(targetElement);
  }

  private static extractTextFromNode(node: Node): string {
    let text = '';

    for (const childNode of Array.from(node.childNodes)) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        text += childNode.textContent || '';
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const element = childNode as Element;
        text += this.extractTextFromElement(element);
      }
    }

    return text.trim();
  }

  private static extractTextFromElement(element: Element): string {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'img':
        return element.getAttribute('alt') || '';
      case 'span':
        return this.extractTextFromNode(element);
      default:
        return element.textContent || '';
    }
  }

  static extractHref(element: Element, selector: string): string {
    const linkElement = this.querySelector(selector, element);
    return linkElement?.getAttribute('href') || '';
  }

  static clickElement(element: Element): boolean {
    try {
      if (element instanceof HTMLButtonElement) {
        element.click();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('❌ Failed to click element:', error);
      return false;
    }
  }
}
