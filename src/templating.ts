export abstract class Result<T> {
  #raw: TemplateStringsArray;
  #stringRes: string | null = null;
  #valueRes: T | null = null;

  constructor(raw: TemplateStringsArray) {
    this.#raw = raw;
  }

  toString(): string {
    if (!this.#stringRes) {
      this.#stringRes = this.#raw.toString();
    }

    return this.#stringRes;
  }

  toValue(): T {
    if (!this.#valueRes) {
      this.#valueRes = this.createValue(this.toString());
    }

    return this.#valueRes;
  }

  abstract createValue(str: string): T;
}

export class TemplatResult extends Result<HTMLTemplateElement> {
  createValue(str: string): HTMLTemplateElement {
    const el = document.createElement("template");
    el.innerHTML = str;

    return el;
  }
}

export class CSSResult extends Result<CSSStyleSheet | HTMLStyleElement> {
  createValue(str: string): CSSStyleSheet | HTMLStyleElement {
    if (document.adoptedStyleSheets) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(str);

      return sheet;
    }

    const style = document.createElement("style");
    style.innerHTML = str;

    return style;
  }
}

export function html(strings: TemplateStringsArray) {
  return new TemplatResult(strings);
}

export function css(strings: TemplateStringsArray) {
  return new CSSResult(strings);
}

export interface ShadowTemplate {
  css?: CSSResult | CSSResult[];
  html?: TemplatResult;
}

export function shadow(el: HTMLElement, template?: ShadowTemplate) {
  if (el.shadowRoot) {
    return el.shadowRoot;
  }

  const shadow = el.attachShadow({ mode: "open" });

  if (template?.css) {
    if (Array.isArray(template.css)) {
      template.css.forEach((css) => {
        appendSheet(shadow, css);
      });
    } else {
      appendSheet(shadow, template.css);
    }
  }

  if (template?.html) {
    shadow.append(template.html.toValue().content.cloneNode(true));
  }

  return shadow;
}

function appendSheet(root: ShadowRoot, css: CSSResult) {
  const value = css.toValue();

  if (value instanceof CSSStyleSheet) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, value];
  } else if (value instanceof HTMLStyleElement) {
    root.append(value);
  }
}
