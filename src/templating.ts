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

export class CSSResult extends Result<CSSStyleSheet> {
  createValue(str: string): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(str);

    return sheet;
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
      shadow.adoptedStyleSheets = template.css.map((css) => css.toValue());
    } else {
      shadow.adoptedStyleSheets = [template.css.toValue()];
    }
  }

  if (template?.html) {
    shadow.append(template.html.toValue().content.cloneNode(true));
  }

  return shadow;
}
