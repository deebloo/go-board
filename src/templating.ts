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

export function template<This extends HTMLElement>(
  _: undefined,
  ctx: ClassFieldDecoratorContext<This, TemplatResult>
) {
  const shadow = applyShadow(ctx);

  return (result: TemplatResult) => {
    shadow().append(result.toValue().content.cloneNode(true));

    return result;
  };
}

export function styles<This extends HTMLElement>(
  _: undefined,
  ctx: ClassFieldDecoratorContext<This, CSSResult>
) {
  const shadow = applyShadow(ctx);

  return (res: CSSResult) => {
    const root = shadow();

    root.adoptedStyleSheets = [...root.adoptedStyleSheets, res.toValue()];

    return res;
  };
}

function applyShadow<This extends HTMLElement>(
  ctx: ClassFieldDecoratorContext<This>
) {
  let shadow: ShadowRoot;

  ctx.addInitializer(function () {
    shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
  });

  return () => shadow;
}
