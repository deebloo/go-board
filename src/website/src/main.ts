import { SGFViewerElement } from "../../sgf-viewer.element";

const viewer = document.querySelector<SGFViewerElement>("sgf-viewer");

const form = document.querySelector("form");
const copyBtn = document.querySelector<HTMLButtonElement>("button#copy");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const pathOrId = data.get("pathOrId");

  if (viewer && pathOrId) {
    viewer.game.board.clear();

    if (!isNaN(parseInt(pathOrId.toString()))) {
      viewer.ogsId = pathOrId.toString();

      viewer.go();
    } else {
      viewer.path = pathOrId.toString();

      viewer.go();
    }
  }
});

copyBtn?.addEventListener("click", () => {
  viewer?.game.board.copyToClipboard();
});
