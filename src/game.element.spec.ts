import { expect } from "@open-wc/testing";

import { GoGameElement } from "./game.element";
import { GoGameService } from "./game.service";
import { Debug, GoConfig } from "./go.ctx";

customElements.define("go-game", GoGameElement);

describe(GoGameElement.name, () => {
  it("should throw if no board is available", async () => {
    const game = new GoGameElement(
      () => new Debug(() => new GoConfig()),
      () => new GoGameService()
    );

    expect(game.connectedCallback.bind(this)).to.throw();
  });
});
