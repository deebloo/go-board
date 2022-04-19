describe("My First Test", () => {
  it("Does not do much!", () => {
    cy.visit("http://localhost:3000");

    const moves = [
      "D16",
      "Q4",
      "R16",
      "D4",
      "C6",
      "F3",
      "C4",
      "C3",
      "B3",
      "B4",
      "C5",
      "B2",
      "D3",
      "C2",
      "E4",
      "D5",
      "D6",
      "E3",
      "E5",
      "D2",
      "P16",
      "C17",
    ];

    moves.forEach((move) => {
      cy.get("go-board").shadow().find(`button#${move}`).click({ force: true });
    });
  });
});
