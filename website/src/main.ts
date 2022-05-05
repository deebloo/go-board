import { SGFViewerElement } from "../../src/sgf-viewer.element";

const url = new URL(window.location.href);
const viewer = document.querySelector<SGFViewerElement>("sgf-viewer");

const form = document.querySelector("form");
const input = form?.querySelector<HTMLInputElement>("input#pathOrId");
const copyBtn = document.querySelector<HTMLButtonElement>("button#copy");
const pauseBtn = document.querySelector<HTMLButtonElement>("button#pause");

if (input) {
  input.value = url.searchParams.get("ogsIdOrPath") || "";
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const pathOrId = data.get("pathOrId");

  if (viewer && pathOrId) {
    if (viewer.isRunning) {
      viewer.isRunning = false;

      return;
    }

    if (!isNaN(parseInt(pathOrId.toString()))) {
      viewer.ogsId = pathOrId.toString();

      viewer.go();

      url.searchParams.set("ogsIdOrPath", viewer.ogsId);
    } else {
      viewer.path = pathOrId.toString();

      viewer.go();

      url.searchParams.set("ogsIdOrPath", viewer.path);
    }

    history.pushState(null, "", url);
  }
});

copyBtn?.addEventListener("click", () => {
  viewer?.game.board.copyToClipboard();

  alert("Board HTML copied to clipboard");
});

pauseBtn?.addEventListener("click", () => {
  viewer?.game.board.copyToClipboard();

  if (viewer) {
    viewer.pause();
  }
});
