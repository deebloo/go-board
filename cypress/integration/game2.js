import { parseSGF } from "../../scripts/sfg-to-coords.mjs";

describe("My First Test", () => {
  it("Does not do much!", () => {
    cy.visit("http://localhost:3000/integration.html");

    cy.fixture("41385759-275-laser_lobster-longlivetheother.sgf").then(
      (res) => {
        const moves = parseSGF(res);

        moves.forEach((move) => {
          cy.get("go-board").shadow().find(`button#${move}`).click();
        });
      }
    );
  });
});
